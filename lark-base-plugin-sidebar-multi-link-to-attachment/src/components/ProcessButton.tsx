/**
 * 处理按钮组件（开始/暂停/继续 + 进度展示）
 * 说明：仅封装交互与状态更新，不修改业务流程；
 * - 输入：字段映射、处理状态、事件回调
 * - 输出：不返回值，通过回调通知外部
 */
import React, { useRef, useState } from 'react';
import { Button, Space, message, Typography, Progress } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined } from '@ant-design/icons';
import { getRecordIds, readMultipleUrlValues, saveAttachmentValue, validateFieldGroups } from '../utils/larkSdk';
import { downloadMultipleFiles } from '../utils/fileDownload';
import type { FieldSelection, ProcessStatus, ProcessControl } from '../types';

interface ProcessButtonProps {
  fieldSelection: FieldSelection;
  processStatus: ProcessStatus;
  onProcessStart: () => void;
  onProcessComplete: (status: ProcessStatus) => void;
  onProgressUpdate: (status: ProcessStatus) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const ProcessButton: React.FC<ProcessButtonProps> = ({
  fieldSelection,
  processStatus,
  onProcessStart,
  onProcessComplete,
  onProgressUpdate,
  onError,
  disabled = false,
}) => {
  const controlRef = useRef<ProcessControl>({ shouldStop: false, isPaused: false });
  const [currentBatch, setCurrentBatch] = useState<string[]>([]);
  
  const handleStartProcess = async () => {
    if (processStatus.isProcessing && !processStatus.isPaused) {
      message.warning('正在处理中，请稍候...');
      return;
    }

    // 验证字段选择（多组）
    const groups = fieldSelection.groups || [];
    if (!groups.length) {
      message.error('请至少添加一组字段映射');
      return;
    }
    const invalid = groups.some(g => !g.urlFieldId || !g.attachmentFieldId || !g.separator);
    if (invalid) {
      message.error('每一组都需要选择链接字段、附件字段，并设置URL分隔符');
      return;
    }

    try {
      // 重置控制状态
      controlRef.current = { shouldStop: false, isPaused: false };
      // 验证字段是否存在
      await validateFieldGroups(groups.map(g => ({ urlFieldId: g.urlFieldId!, attachmentFieldId: g.attachmentFieldId! })));
      
      // 获取所有记录ID
      const recordIds = await getRecordIds();
      
      if (recordIds.length === 0) {
        message.warning('表格中没有数据');
        onProcessComplete({
          ...processStatus,
          isProcessing: false,
          total: 0,
          processed: 0,
          success: 0,
          failed: 0,
        });
        return;
      }
      
      // 初始化进度状态
      const startTime = Date.now();
      const initialStatus: ProcessStatus = {
        isProcessing: true,
        isPaused: false,
        total: recordIds.length * groups.length,
        processed: processStatus.isPaused ? processStatus.processed : 0,
        success: processStatus.isPaused ? processStatus.success : 0,
        failed: processStatus.isPaused ? processStatus.failed : 0,
        startTime,
        speed: 0,
        estimatedTime: 0,
      };
      
      onProcessStart();
      onProgressUpdate(initialStatus);
      
      // 从暂停位置继续或从头开始
      const startIndex = processStatus.isPaused ? Math.floor(processStatus.processed / groups.length) : 0;
      const remainingRecords = recordIds.slice(startIndex);
      
      let successCount = initialStatus.success;
      let failedCount = initialStatus.failed;
      let processedCount = initialStatus.processed;
      
      // 高并发下载配置（仅针对单条记录的多个文件）
      const MAX_CONCURRENT_DOWNLOADS = 8; // 每条记录最多同时下载8个文件
      
      // 严格按顺序逐条处理记录（并遍历所有映射组）
      for (let i = 0; i < remainingRecords.length; i++) {
        // 检查是否需要停止
        if (controlRef.current.shouldStop) {
          break;
        }
        
        // 检查是否需要暂停
        while (controlRef.current.isPaused) {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (controlRef.current.shouldStop) {
            break;
          }
        }
        
        if (controlRef.current.shouldStop) {
          break;
        }
        
        const recordId = remainingRecords[i];
        console.log(`正在处理第 ${startIndex + i + 1}/${recordIds.length} 条记录: ${recordId}`);

        for (let gIndex = 0; gIndex < groups.length; gIndex++) {
          const group = groups[gIndex];
          try {
            // 读取多个URL（按组配置）
            const urls = await readMultipleUrlValues(recordId, group.urlFieldId!, group.separator);
            
            if (urls.length === 0) {
              console.log(`记录 ${recordId} 的第 ${gIndex + 1} 组URL字段为空，跳过`);
              processedCount++;
              
              // 更新进度（按组累计）
              const elapsed = (Date.now() - startTime) / 1000;
              const speed = processedCount / elapsed;
              const remaining = initialStatus.total - (startIndex * groups.length + processedCount);
              const estimatedTime = remaining > 0 ? remaining / speed : 0;
              
              onProgressUpdate({
                isProcessing: true,
                isPaused: false,
                total: initialStatus.total,
                processed: startIndex * groups.length + processedCount,
                success: successCount,
                failed: failedCount,
                startTime,
                speed: Math.round(speed * 100) / 100,
                estimatedTime: Math.round(estimatedTime),
              });
              
              continue;
            }
            
            // 批量下载文件（仅此处使用并发）
            console.log(`开始下载 ${urls.length} 个文件（第 ${gIndex + 1} 组）...`);
            const downloadResult = await downloadMultipleFiles(urls, MAX_CONCURRENT_DOWNLOADS);
            
            if (downloadResult.success && downloadResult.files.length > 0) {
              // 保存到附件字段（按组配置）
              console.log(`开始保存 ${downloadResult.files.length} 个文件到附件字段（第 ${gIndex + 1} 组）...`);
              await saveAttachmentValue(recordId, group.attachmentFieldId!, downloadResult.files, fieldSelection.overwriteMode);
              
              successCount++;
              console.log(`✅ 记录 ${recordId}（第 ${gIndex + 1} 组）处理成功，保存了 ${downloadResult.files.length} 个文件`);
            } else {
              failedCount++;
              console.warn(`❌ 记录 ${recordId}（第 ${gIndex + 1} 组）处理失败: ${downloadResult.errors.join('; ')}`);
            }
            
          } catch (error: any) {
            failedCount++;
            console.error(`❌ 记录 ${recordId}（第 ${gIndex + 1} 组）处理异常:`, error.message);
          }
          
          processedCount++;
          
          // 计算处理速度和预计时间（按组累计）
          const elapsed = (Date.now() - startTime) / 1000;
          const speed = processedCount / elapsed;
          const remaining = initialStatus.total - (startIndex * groups.length + processedCount);
          const estimatedTime = remaining > 0 ? remaining / speed : 0;
          
          // 更新进度
          const currentStatus: ProcessStatus = {
            isProcessing: true,
            isPaused: controlRef.current.isPaused,
            total: initialStatus.total,
            processed: startIndex * groups.length + processedCount,
            success: successCount,
            failed: failedCount,
            startTime,
            speed: Math.round(speed * 100) / 100,
            estimatedTime: Math.round(estimatedTime),
          };
          
          onProgressUpdate(currentStatus);
          
          // 短暂延迟，避免过度占用资源（减少延迟提升速度）
          await new Promise(resolve => setTimeout(resolve, 40));
        }
        
        // 计算处理速度和预计时间
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = processedCount / elapsed;
        const remaining = recordIds.length - (startIndex + processedCount);
        const estimatedTime = remaining > 0 ? remaining / speed : 0;
        
        // 更新进度
        const currentStatus: ProcessStatus = {
          isProcessing: true,
          isPaused: controlRef.current.isPaused,
          total: recordIds.length,
          processed: startIndex + processedCount,
          success: successCount,
          failed: failedCount,
          startTime,
          speed: Math.round(speed * 100) / 100,
          estimatedTime: Math.round(estimatedTime),
        };
        
        onProgressUpdate(currentStatus);
        
        // 短暂延迟，避免过度占用资源（减少延迟提升速度）
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // 处理完成
      const finalStatus: ProcessStatus = {
        isProcessing: false,
        isPaused: false,
        total: initialStatus.total,
        processed: startIndex * groups.length + processedCount,
        success: successCount,
        failed: failedCount,
        startTime,
        speed: processedCount / ((Date.now() - startTime) / 1000),
        estimatedTime: 0,
      };
      
      onProcessComplete(finalStatus);
      setCurrentBatch([]);
      
      if (controlRef.current.shouldStop) {
        message.info('处理已停止');
      } else {
        message.success(`处理完成！成功: ${successCount}, 失败: ${failedCount}`);
      }
      
    } catch (error: any) {
      console.error('处理过程中发生错误:', error);
      onError(error.message || '处理失败');
      onProcessComplete({
        ...processStatus,
        isProcessing: false,
        isPaused: false,
      });
    }
  };
  
  const handlePauseResume = () => {
    if (processStatus.isProcessing) {
      if (processStatus.isPaused) {
        // 恢复处理
        controlRef.current.isPaused = false;
        onProgressUpdate({
          ...processStatus,
          isPaused: false,
        });
        message.info('处理已恢复');
      } else {
        // 暂停处理
        controlRef.current.isPaused = true;
        onProgressUpdate({
          ...processStatus,
          isPaused: true,
        });
        message.info('处理已暂停');
      }
    }
  };

  // 单按钮点击逻辑：未开始=开始；运行中=暂停；暂停中=继续
  const handleMainButtonClick = () => {
    if (!processStatus.isProcessing) return handleStartProcess();
    return handlePauseResume();
  };
  
  const handleStop = () => {
    if (processStatus.isProcessing) {
      controlRef.current.shouldStop = true;
      controlRef.current.isPaused = false;
      message.info('正在停止处理...');
    }
  };
  
  // 进度条百分比
  const percent = Math.round((Math.min(processStatus.processed, processStatus.total) / (processStatus.total || 1)) * 100);

  // 恢复「处理中」的内联小图标（圆里一个小方块），不显示实时百分比
  const ProcessingIcon: React.FC = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" fill="none" />
      <rect x="5.25" y="5.25" width="5.5" height="5.5" rx="0.5" fill="currentColor" />
    </svg>
  );

  // 按钮三态
  const running = processStatus.isProcessing && !processStatus.isPaused;
  const mainLabel = !processStatus.isProcessing ? '开始处理' : (processStatus.isPaused ? '继续处理' : '处理中');
  const mainStyle = running ? { backgroundColor: '#ffffff', borderColor: '#d9d9d9', color: '#333' } : undefined;
  const isDisabled = disabled || !fieldSelection.groups?.length || fieldSelection.groups.some(g => !g.urlFieldId || !g.attachmentFieldId || !g.separator);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={8}>
      <Space>
        <Button
          type={running ? 'default' : 'primary'}
          size="middle"
          onClick={handleMainButtonClick}
          loading={false}
          disabled={isDisabled && !processStatus.isProcessing}
          style={mainStyle}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {running && <ProcessingIcon />}
            <span>{mainLabel}</span>
          </span>
        </Button>
      </Space>

      {/* 只展示总进度与线性进度条，不展示速度/预计剩余 */}
      {processStatus.total > 0 && (
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <Typography.Text>
              进度：{Math.min(processStatus.processed, processStatus.total)}/{processStatus.total}（成功 {processStatus.success}，失败 {processStatus.failed}）
            </Typography.Text>
          </div>
          <Progress percent={percent} size="small" status={processStatus.isProcessing ? 'active' : 'normal'} showInfo />
        </div>
      )}
    </Space>
  );
};

export default ProcessButton;