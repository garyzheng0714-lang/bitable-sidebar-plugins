import { v4 as uuidv4 } from 'uuid';
import type { Template } from '@/types';

/**
 * 模板服务
 * 处理模板的上传、存储、管理等功能
 */
export class TemplateService {
  private static instance: TemplateService;
  private templates: Map<string, Template> = new Map();
  private readonly STORAGE_KEY = 'docx_templates';

  static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  constructor() {
    this.loadTemplatesFromStorage();
  }

  /**
   * 从本地存储加载模板
   */
  private loadTemplatesFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const templates = JSON.parse(stored) as Template[];
        templates.forEach(template => {
          this.templates.set(template.id, template);
        });
      }
    } catch (error) {
      console.error('Failed to load templates from storage:', error);
    }
  }

  /**
   * 保存模板到本地存储
   */
  private saveTemplatesToStorage() {
    const templates = Array.from(this.templates.values());
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
    } catch (error: any) {
      console.error('Failed to save templates to storage:', error);
      // 判断是否为配额限制（不同浏览器错误码/名称可能不同）
      const isQuotaError =
        error?.name === 'QuotaExceededError' ||
        error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        error?.code === 22 ||
        /quota|exceed/i.test(String(error?.message || ''));
      if (isQuotaError) {
        throw new Error('存储空间不足，请删除一些模板或缩小文件后再试');
      }
      throw new Error('保存模板到本地存储失败');
    }
  }

  /**
   * 上传模板文件
   */
  async uploadTemplate(file: File, name?: string, tags?: string[], notes?: string): Promise<Template> {
    try {
      // 验证文件类型（大小写不敏感）
      if (!/\.docx$/i.test(file.name)) {
        throw new Error('只支持 .docx 格式的文件');
      }

      // 将文件转换为 base64 存储
      const fileToken = await this.fileToBase64(file);
      
      const template: Template = {
        id: uuidv4(),
        name: name || file.name.replace(/\.docx$/i, ''),
        fileToken,
        version: '1.0.0',
        tags: tags || [],
        notes: notes || '',
        updatedAt: new Date().toISOString(),
        createdBy: 'current_user', // 这里可以从 Base SDK 获取当前用户信息
        status: 'active',
      };

      this.templates.set(template.id, template);
      this.saveTemplatesToStorage();

      return template;
    } catch (error: any) {
      console.error('Failed to upload template:', error);
      // 透传更明确的错误信息到 UI
      throw new Error(error?.message || '模板上传失败');
    }
  }

  /**
   * 获取所有模板
   */
  getTemplates(): Template[] {
    return Array.from(this.templates.values())
      .filter(template => template.status === 'active')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * 根据ID获取模板
   */
  getTemplate(id: string): Template | null {
    return this.templates.get(id) || null;
  }

  /**
   * 搜索模板
   */
  searchTemplates(keyword: string, tags?: string[]): Template[] {
    const allTemplates = this.getTemplates();
    
    return allTemplates.filter(template => {
      const matchKeyword = !keyword || 
        template.name.toLowerCase().includes(keyword.toLowerCase()) ||
        (template.notes && template.notes.toLowerCase().includes(keyword.toLowerCase()));
      
      const matchTags = !tags || tags.length === 0 ||
        (template.tags && tags.some(tag => template.tags!.includes(tag)));
      
      return matchKeyword && matchTags;
    });
  }

  /**
   * 更新模板
   */
  updateTemplate(id: string, updates: Partial<Template>): Template | null {
    const template = this.templates.get(id);
    if (!template) {
      return null;
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.templates.set(id, updatedTemplate);
    this.saveTemplatesToStorage();

    return updatedTemplate;
  }

  /**
   * 删除模板
   */
  deleteTemplate(id: string): boolean {
    const template = this.templates.get(id);
    if (!template) {
      return false;
    }

    // 软删除，设置状态为 inactive
    template.status = 'inactive';
    template.updatedAt = new Date().toISOString();
    
    this.templates.set(id, template);
    this.saveTemplatesToStorage();

    return true;
  }

  /**
   * 获取模板文件内容
   */
  async getTemplateFile(id: string): Promise<File | null> {
    const template = this.templates.get(id);
    if (!template) {
      return null;
    }

    try {
      const blob = await this.base64ToBlob(template.fileToken);
      return new File([blob], `${template.name}.docx`, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
    } catch (error) {
      console.error('Failed to get template file:', error);
      return null;
    }
  }

  /**
   * 获取所有标签
   */
  getAllTags(): string[] {
    const tagSet = new Set<string>();
    this.getTemplates().forEach(template => {
      if (template.tags) {
        template.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }

  /**
   * 导出当前所有有效模板为 JSON 字符串
   */
  exportTemplatesAsJSON(): string {
    const payload = {
      meta: {
        exportedAt: new Date().toISOString(),
        count: this.getTemplates().length,
        version: '1.0.0',
      },
      templates: this.getTemplates(),
    };
    return JSON.stringify(payload, null, 2);
  }

  /**
   * 导出为 JSON Blob（便于直接下载）
   */
  exportTemplatesBlob(): Blob {
    const json = this.exportTemplatesAsJSON();
    return new Blob([json], { type: 'application/json;charset=utf-8' });
  }

  /**
   * 从 JSON 字符串导入模板
   * - 去重规则：如果与现有模板 fileToken 完全一致且名称也一致，则跳过
   * - ID 冲突：无论是否冲突，导入时都会为新模板分配新的 id，避免覆盖
   */
  importTemplatesFromJSON(json: string): { imported: number; skipped: number } {
    console.log('开始解析JSON数据...');
    
    let data: any;
    try {
      data = JSON.parse(json);
      console.log('JSON解析成功:', data);
    } catch (e) {
      console.error('JSON解析失败:', e);
      throw new Error('导入失败：JSON 格式不正确');
    }

    const incoming: any[] = Array.isArray(data)
      ? data
      : (Array.isArray(data?.templates) ? data.templates : []);
    
    console.log('提取到的模板数组:', incoming);
    
    if (!Array.isArray(incoming)) {
      throw new Error('导入失败：未找到 templates 数组');
    }

    const existing = Array.from(this.templates.values()).filter(t => t.status !== 'inactive');
    const tokenSet = new Set(existing.map(t => t.fileToken));

    console.log('现有模板数量:', existing.length);
    console.log('待导入模板数量:', incoming.length);

    let imported = 0;
    let skipped = 0;

    for (const item of incoming) {
      console.log('处理模板项:', item);
      
      // 基础校验
      if (!item || typeof item !== 'object' || !item.name || !item.fileToken) {
        console.log('跳过无效模板项:', item);
        skipped++;
        continue;
      }

      const isDuplicateContent = tokenSet.has(item.fileToken);
      const sameNameExists = existing.some(t => t.name === item.name && t.fileToken === item.fileToken);
      
      console.log('重复检查:', { isDuplicateContent, sameNameExists });
      
      if (isDuplicateContent && sameNameExists) {
        // 完全重复，跳过
        console.log('跳过重复模板:', item.name);
        skipped++;
        continue;
      }

      // 构造新模板，分配新 id，更新时间使用当前时间
      const newTemplate: Template = {
        id: uuidv4(),
        name: item.name,
        fileToken: item.fileToken,
        version: typeof item.version === 'string' ? item.version : '1.0.0',
        tags: Array.isArray(item.tags) ? item.tags : [],
        notes: typeof item.notes === 'string' ? item.notes : '',
        updatedAt: new Date().toISOString(),
        createdBy: typeof item.createdBy === 'string' ? item.createdBy : 'imported',
        status: 'active',
      };

      console.log('创建新模板:', newTemplate);

      this.templates.set(newTemplate.id, newTemplate);
      tokenSet.add(newTemplate.fileToken);
      imported++;
    }

    // 统一保存（可能触发配额错误）
    try {
      this.saveTemplatesToStorage();
      console.log('模板保存成功');
    } catch (error) {
      console.error('保存模板失败:', error);
      throw error;
    }

    console.log('导入完成:', { imported, skipped });
    return { imported, skipped };
  }

  /**
   * 文件转 base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // 移除 data:xxx;base64, 前缀
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * base64 转 Blob
   */
  private base64ToBlob(base64: string): Promise<Blob> {
    return new Promise((resolve) => {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      resolve(blob);
    });
  }
}

// 导出单例实例
export const templateService = TemplateService.getInstance();