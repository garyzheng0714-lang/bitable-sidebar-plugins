/**
 * 应用入口（侧边栏插件）
 * 说明：负责初始化字段选项与承载配置与处理操作的布局；逻辑保持与原版一致。
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, message } from 'antd';
import FieldSelector from './components/FieldSelector';
import ProcessButton from './components/ProcessButton';
import { FieldSelection, ProcessStatus, ProcessError, FieldOption, FieldGroup } from './types';
import { getUrlFields, getAttachmentFields } from './utils/larkSdk';

const { Header, Content } = Layout;

function App() {
  const [fieldSelection, setFieldSelection] = useState<FieldSelection>({
    groups: [{ urlFieldId: null, attachmentFieldId: null, separator: ',' }],
    overwriteMode: false
  });

  const [processStatus, setProcessStatus] = useState<ProcessStatus>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    isProcessing: false,
    isPaused: false
  });
  // 删除 controlRef
  // const controlRef = useRef<ProcessControl>({ shouldStop: false, isPaused: false });
  const [urlFields, setUrlFields] = useState<FieldOption[]>([]);
  const [attachmentFields, setAttachmentFields] = useState<FieldOption[]>([]);
  const [errors, setErrors] = useState<ProcessError[]>([]);
  const [loading, setLoading] = useState(true);

  const handleProcessStart = useCallback(() => {
    setProcessStatus(prev => ({ 
      ...prev, 
      isProcessing: true,
      isPaused: false,
      processed: prev.isPaused ? prev.processed : 0,
      success: prev.isPaused ? prev.success : 0,
      failed: prev.isPaused ? prev.failed : 0,
      startTime: prev.isPaused ? prev.startTime : Date.now(),
      speed: 0,
      estimatedTime: 0
    }));
  }, []);

  const handleProcessComplete = useCallback((status: ProcessStatus) => {
    setProcessStatus(status);
  }, []);

  const handleProgressUpdate = useCallback((status: ProcessStatus) => {
    setProcessStatus(status);
  }, []);

  const handleError = useCallback((error: string) => {
    console.error('处理错误:', error);
    message.error(error);
  }, []);

  useEffect(() => {
    const initializeFields = async () => {
      try {
        setLoading(true);
        const [urlFieldList, attachmentFieldList] = await Promise.all([
          getUrlFields(),
          getAttachmentFields()
        ]);
        setUrlFields(urlFieldList);
        setAttachmentFields(attachmentFieldList);
        if (urlFieldList.length === 0) {
          message.warning('当前表格中没有找到URL类型的字段，请先添加链接字段');
        }
        if (attachmentFieldList.length === 0) {
          message.warning('当前表格中没有找到附件类型的字段，请先添加附件字段');
        }
        // 移除：字段信息加载成功 的提示
        const defaultUrlId = urlFieldList.length === 1 ? urlFieldList[0].value : null;
        const defaultAttachmentId = attachmentFieldList.length === 1 ? attachmentFieldList[0].value : null;
        if (defaultUrlId || defaultAttachmentId) {
          setFieldSelection(prev => ({
            ...prev,
            groups: prev.groups?.length ? prev.groups.map((g, i) => (
              i === 0 ? {
                ...g,
                urlFieldId: g.urlFieldId ?? defaultUrlId,
                attachmentFieldId: g.attachmentFieldId ?? defaultAttachmentId
              } : g
            )) : [{ urlFieldId: defaultUrlId, attachmentFieldId: defaultAttachmentId, separator: ',' }]
          }));
        }
      } catch (error: any) {
        console.error('初始化字段失败:', error);
        message.error(error.message || '获取字段信息失败，请确保在飞书多维表格中打开此插件');
      } finally {
        setLoading(false);
      }
    };

    initializeFields();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', background: '#ffffff' }}>
      <Header style={{ 
        background: '#ffffff',
        padding: 0,
        borderBottom: '1px solid #ebeef5',
      }}>
        {/* 顶部全宽横幅 */}
        <div style={{ width: '100%', height: 112, overflow: 'hidden' }}>
          <img
            src="https://ark-auto-2103212774-cn-beijing-default.tos-cn-beijing.volces.com/assistant_image/%E9%A3%9E%E4%B9%A6%E6%96%87%E6%A1%A3%E5%B0%81%E9%9D%A2%E5%9B%BE/FBIF%20%E9%A3%9E%E4%B9%A6%E6%96%87%E6%A1%A3%E5%B0%81%E9%9D%A2%E5%9B%BE.jpeg"
            alt="FBIF Banner"
            referrerPolicy="no-referrer"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://i.imgur.com/WU0xG2f.jpeg'; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        {/* 移除原有的文本标题区域 */}
      </Header>
      
      <Content style={{ 
        padding: '24px 16px 16px',
        maxWidth: '960px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* 扁平分区：字段配置（小标题已去掉） */}
        <section style={{ marginBottom: 16 }}>
          <FieldSelector
            urlFields={urlFields}
            attachmentFields={attachmentFields}
            fieldSelection={fieldSelection}
            onFieldSelectionChange={setFieldSelection}
            disabled={loading || processStatus.isProcessing}
          />
        </section>

        {/* 扁平分区：操作按钮 + 内联进度 */}
        <section style={{ marginBottom: 16 }}>
          <ProcessButton
            fieldSelection={fieldSelection}
            processStatus={processStatus}
            onProcessStart={handleProcessStart}
            onProcessComplete={handleProcessComplete}
            onProgressUpdate={handleProgressUpdate}
            onError={handleError}
            disabled={loading}
          />
        </section>
      </Content>
    </Layout>
  );
}

export default App;