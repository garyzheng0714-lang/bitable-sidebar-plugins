import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import type { Template, RenderJob, RenderContext, FieldInfo } from '@/types';
import { templateService } from './templateService';
import { baseService } from './baseService';

/**
 * 渲染服务
 * 处理Word模板的渲染和数据替换
 */
export class RenderService {
  private static instance: RenderService;
  private renderJobs: Map<string, RenderJob> = new Map();

  static getInstance(): RenderService {
    if (!RenderService.instance) {
      RenderService.instance = new RenderService();
    }
    return RenderService.instance;
  }

  /**
   * 渲染单条记录
   */
  async renderSingle(templateId: string, recordData: any, fields: FieldInfo[]): Promise<Blob> {
    try {
      const template = templateService.getTemplate(templateId);
      if (!template) {
        throw new Error('模板不存在');
      }

      const templateFile = await templateService.getTemplateFile(templateId);
      if (!templateFile) {
        throw new Error('无法获取模板文件');
      }

      // 准备渲染数据
      const renderData = this.prepareRenderData(recordData, fields);

      // 执行渲染
      const renderedBlob = await this.executeRender(templateFile, renderData);
      
      return renderedBlob;
    } catch (error) {
      console.error('Failed to render single record:', error);
      throw new Error('渲染失败');
    }
  }

  // 新增：直接使用外部提供的数据对象进行渲染（用于占位符-字段映射后渲染）
  async renderWithData(templateId: string, data: any): Promise<Blob> {
    try {
      const templateFile = await templateService.getTemplateFile(templateId);
      if (!templateFile) {
        throw new Error('无法获取模板文件');
      }
      const renderedBlob = await this.executeRender(templateFile, data || {});
      return renderedBlob;
    } catch (error) {
      console.error('Failed to render with explicit data:', error);
      throw new Error('渲染失败');
    }
  }

  /**
   * 批量渲染记录
   */
  async renderBatch(context: RenderContext): Promise<RenderJob> {
    const jobId = this.generateJobId();
    
    const job: RenderJob = {
      id: jobId,
      templateId: context.template.id,
      tableId: '', // 从 context 中获取
      recordIds: context.records.map(r => r.recordId),
      output: context.output,
      status: 'pending',
      stats: {
        total: context.records.length,
        ok: 0,
        fail: 0,
      },
      logs: [],
    };

    this.renderJobs.set(jobId, job);

    // 异步执行批量渲染
    this.executeBatchRender(job, context).catch(error => {
      console.error('Batch render failed:', error);
      job.status = 'failed';
      this.renderJobs.set(jobId, job);
    });

    return job;
  }

  /**
   * 执行批量渲染
   */
  private async executeBatchRender(job: RenderJob, context: RenderContext) {
    const startTime = Date.now();
    job.status = 'running';
    this.renderJobs.set(job.id, job);

    const templateFile = await templateService.getTemplateFile(context.template.id);
    if (!templateFile) {
      throw new Error('无法获取模板文件');
    }

    const results: Blob[] = [];

    for (let i = 0; i < context.records.length; i++) {
      const record = context.records[i];
      
      try {
        const renderData = this.prepareRenderData(record, context.fields);
        const renderedBlob = await this.executeRender(templateFile, renderData);
        
        results.push(renderedBlob);
        job.stats.ok++;
        job.logs.push({
          recordId: record.recordId,
          ok: true,
        });
      } catch (error) {
        job.stats.fail++;
        job.logs.push({
          recordId: record.recordId,
          ok: false,
          message: error instanceof Error ? error.message : '渲染失败',
        });
      }

      // 更新进度
      this.renderJobs.set(job.id, { ...job });
    }

    // 处理输出
    await this.handleBatchOutput(context.output, results, context.template.name);

    // 完成任务
    job.status = job.stats.fail > 0 ? 'partial' : 'success';
    job.stats.durationMs = Date.now() - startTime;
    this.renderJobs.set(job.id, job);
  }

  /**
   * 执行模板渲染
   */
  private async executeRender(templateFile: File, data: any): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const zip = new PizZip(arrayBuffer);
          
          const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            // 支持使用 {{ }} 作为占位符，便于与编辑器和说明文档一致
            delimiters: { start: '{{', end: '}}' },
            // 当占位符对应的值为 null/undefined 时，输出空字符串，避免“undefined”字样
            nullGetter: () => ''
          });

          // 设置数据
          doc.setData(data);

          // 渲染文档
          doc.render();

          // 生成输出
          const output = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });

          resolve(output);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(templateFile);
    });
  }

  /**
   * 准备渲染数据
   */
  private prepareRenderData(record: any, fields: FieldInfo[]): any {
    const data: any = {};

    const recFields = record.fields;

    // 处理基本字段
    fields.forEach(field => {
      // 兼容对象/数组两种形态
      let raw: any;
      if (Array.isArray(recFields)) {
        const entry = recFields.find((x: any) => x?.fieldId === field.id || x?.id === field.id || x?.fieldId === field.name);
        raw = entry ? (entry.value ?? entry) : undefined;
      } else {
        raw = (recFields?.[field.id] ?? recFields?.[field.name]);
      }

      const formatted = this.formatFieldValue(raw, field.type);
      // 同时支持按“字段名”和“字段ID”占位
      data[field.name] = formatted;
      data[field.id] = formatted;

      // 兼容：使用字段描述作为占位符（若有）
      if (field.description) {
        data[field.description] = formatted;
      }

      // 兼容：去除首尾空格、去除所有空格（适配 {{ 甲方 }} / {{甲方}} / {{甲 方}} 等写法）
      const nameTrim = (field.name || '').trim();
      if (nameTrim && nameTrim !== field.name) {
        data[nameTrim] = formatted;
      }
      const nameNoSpace = nameTrim.replace(/[\s\u3000]+/g, '');
      if (nameNoSpace && nameNoSpace !== nameTrim) {
        data[nameNoSpace] = formatted;
      }

      if (field.description) {
        const descTrim = field.description.trim();
        if (descTrim && descTrim !== field.description) {
          data[descTrim] = formatted;
        }
        const descNoSpace = descTrim.replace(/[\s\u3000]+/g, '');
        if (descNoSpace && descNoSpace !== descTrim) {
          data[descNoSpace] = formatted;
        }
      }
    });

    // 添加一些辅助数据
    data._recordId = record.recordId;
    data._timestamp = new Date().toISOString();
    data._date = new Date().toLocaleDateString('zh-CN');
    data._time = new Date().toLocaleTimeString('zh-CN');

    return data;
  }

  /**
   * 格式化字段值
   */
  private formatFieldValue(value: any, fieldType: string): any {
    if (value === null || value === undefined) {
      return '';
    }

    switch (fieldType) {
      case '1': // 文本
        return String(value);
      case '2': // 数字
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      case '3': // 单选
        return value?.text || String(value);
      case '4': // 多选
        return Array.isArray(value) 
          ? value.map(v => v?.text || String(v)).join(', ')
          : String(value);
      case '5': // 日期
        return value ? new Date(value).toLocaleDateString('zh-CN') : '';
      case '7': // 复选框
        return value ? '是' : '否';
      case '11': // 人员
        return Array.isArray(value)
          ? value.map(v => v?.name || String(v)).join(', ')
          : value?.name || String(value);
      case '17': // 附件
        return Array.isArray(value)
          ? value.map(v => v?.name || String(v)).join(', ')
          : value?.name || String(value);
      default:
        return String(value);
    }
  }

  /**
   * 处理批量输出
   */
  private async handleBatchOutput(output: any, results: Blob[], templateName: string) {
    switch (output.type) {
      case 'download':
        // 如果只有一个文件，直接下载
        if (results.length === 1) {
          saveAs(results[0], `${templateName}_${Date.now()}.docx`);
        } else {
          // 多个文件需要打包下载（这里简化处理，逐个下载）
          results.forEach((blob, index) => {
            saveAs(blob, `${templateName}_${index + 1}_${Date.now()}.docx`);
          });
        }
        break;
        
      case 'attachment':
        // 写入到多维表格附件字段
        if (output.fieldId) {
          // 这里需要实现写入附件的逻辑
          console.log('Writing to attachment field:', output.fieldId);
        }
        break;
        
      case 'print':
        // 打印预览（这里需要转换为HTML）
        console.log('Print preview not implemented yet');
        break;
    }
  }

  /**
   * 下载单个文件
   */
  downloadFile(blob: Blob, filename: string) {
    saveAs(blob, filename);
  }

  /**
   * 获取渲染任务状态
   */
  getRenderJob(jobId: string): RenderJob | null {
    return this.renderJobs.get(jobId) || null;
  }

  /**
   * 获取所有渲染任务
   */
  getAllRenderJobs(): RenderJob[] {
    return Array.from(this.renderJobs.values())
      .sort((a, b) => new Date(b.stats.durationMs || 0).getTime() - new Date(a.stats.durationMs || 0).getTime());
  }

  /**
   * 生成任务ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 清理完成的任务
   */
  cleanupJobs() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24小时

    for (const [jobId, job] of this.renderJobs.entries()) {
      if (job.status !== 'running' && job.stats.durationMs) {
        const jobTime = now - job.stats.durationMs;
        if (jobTime > maxAge) {
          this.renderJobs.delete(jobId);
        }
      }
    }
  }
}

// 导出单例实例
export const renderService = RenderService.getInstance();