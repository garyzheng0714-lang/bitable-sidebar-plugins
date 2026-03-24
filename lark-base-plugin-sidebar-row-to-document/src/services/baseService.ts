import { bitable } from '@lark-base-open/js-sdk';
import type { FieldInfo, TableInfo } from '@/types';

/**
 * Base SDK 服务封装
 * 提供与多维表格交互的基础功能
 */
export class BaseService {
  private static instance: BaseService;
  
  static getInstance(): BaseService {
    if (!BaseService.instance) {
      BaseService.instance = new BaseService();
    }
    return BaseService.instance;
  }

  /**
   * 获取当前活跃的表格
   */
  async getActiveTable() {
    try {
      const table = await bitable.base.getActiveTable();
      return table;
    } catch (error) {
      console.error('Failed to get active table:', error);
      throw new Error('无法获取当前表格');
    }
  }

  /**
   * 获取表格信息
   */
  async getTableInfo(tableId?: string): Promise<TableInfo> {
    try {
      const table = tableId 
        ? await bitable.base.getTableById(tableId)
        : await this.getActiveTable();
      
      const tableMeta = await table.getMeta();
      const fieldMetaList = await table.getFieldMetaList();
      
      const fields: FieldInfo[] = fieldMetaList.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type.toString(),
        description: field.description ? String(field.description) : '',
      }));

      return {
        id: tableMeta.id,
        name: tableMeta.name,
        fields,
      };
    } catch (error) {
      console.error('Failed to get table info:', error);
      throw new Error('无法获取表格信息');
    }
  }

  /**
   * 获取字段列表
   */
  async getFields(tableId?: string): Promise<FieldInfo[]> {
    try {
      const table = tableId 
        ? await bitable.base.getTableById(tableId)
        : await this.getActiveTable();
      
      const fieldMetaList = await table.getFieldMetaList();
      
      return fieldMetaList.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type.toString(),
        description: field.description ? String(field.description) : '',
      }));
    } catch (error) {
      console.error('Failed to get fields:', error);
      throw new Error('无法获取字段列表');
    }
  }

  /**
   * 获取记录数据
   */
  async getRecords(tableId?: string, viewId?: string, limit?: number) {
    try {
      const table = tableId 
        ? await bitable.base.getTableById(tableId)
        : await this.getActiveTable();
      
      const view = viewId 
        ? await table.getViewById(viewId)
        : await table.getActiveView();
      
      const recordIdList = await view.getVisibleRecordIdList();
      const limitedIds = limit ? recordIdList.slice(0, limit) : recordIdList;
      
      const records = [];
      for (const recordId of limitedIds) {
        const recordValues = await table.getRecordById(recordId);
        records.push({
          recordId,
          fields: recordValues.fields,
        });
      }
      
      return records;
    } catch (error) {
      console.error('Failed to get records:', error);
      throw new Error('无法获取记录数据');
    }
  }

  /**
   * 获取当前选中的记录
   */
  async getSelectedRecords() {
    try {
      const selection = await bitable.base.getSelection();
      if (!selection.recordId) {
        throw new Error('未选中任何记录');
      }
      
      const table = await this.getActiveTable();
      const record = await table.getRecordById(selection.recordId);
      
      return [{
        recordId: selection.recordId,
        fields: record.fields,
      }];
    } catch (error) {
      console.error('Failed to get selected records:', error);
      throw new Error('无法获取选中的记录');
    }
  }

  /**
   * 写入附件到指定字段
   */
  async writeAttachment(tableId: string, recordId: string, fieldId: string, file: File) {
    try {
      const table = await bitable.base.getTableById(tableId);
      const attachmentField = await table.getField(fieldId);
      
      // 上传文件并写入附件字段
      await attachmentField.setValue(recordId, [file]);
      
      return true;
    } catch (error) {
      console.error('Failed to write attachment:', error);
      throw new Error('无法写入附件');
    }
  }

  /**
   * 监听表格变化 - 根据边栏插件开发指南实现
   */
  onTableChange(callback: (event: any) => void) {
    try {
      // 监听表格选择变化
      const unsubscribeSelection = bitable.base.onSelectionChange((event) => {
        // 检查是否是表格切换
        if (event.data?.tableId) {
          callback(event);
          // 触发全局事件，通知所有监听的组件
          window.dispatchEvent(new CustomEvent('table-changed', { detail: event }));
        }
      });

      // 返回清理函数
      return () => {
        unsubscribeSelection?.();
      };
    } catch (error) {
      console.error('Failed to listen table change:', error);
      return () => {};
    }
  }

  /**
   * 监听字段变化 - 根据边栏插件开发指南实现
   */
  onFieldChange(callback: (event: any) => void) {
    try {
      // 由于SDK限制，使用选择变化来间接监听字段变化
      const unsubscribeSelection = bitable.base.onSelectionChange((event) => {
        // 当选择变化时，可能意味着字段结构发生了变化
        callback(event);
        window.dispatchEvent(new CustomEvent('field-changed', { detail: event }));
      });

      return unsubscribeSelection;
    } catch (error) {
      console.error('Failed to listen field change:', error);
      return () => {};
    }
  }

  /**
   * 监听视图变化
   */
  onViewChange(callback: (event: any) => void) {
    try {
      // 监听视图切换
      const unsubscribeViewChange = bitable.base.onSelectionChange((event) => {
        if (event.data?.viewId) {
          callback(event);
          window.dispatchEvent(new CustomEvent('view-changed', { detail: event }));
        }
      });

      return unsubscribeViewChange;
    } catch (error) {
      console.error('Failed to listen view change:', error);
      return () => {};
    }
  }

  /**
   * 启动全局监听 - 自动监听所有变化
   */
  startGlobalListening() {
    try {
      // 启动表格监听
      this.onTableChange((event) => {
        console.log('Table changed:', event);
      });

      // 启动字段监听
      this.onFieldChange((event) => {
        console.log('Field changed:', event);
      });

      // 启动视图监听
      this.onViewChange((event) => {
        console.log('View changed:', event);
      });

      console.log('Global listening started');
    } catch (error) {
      console.error('Failed to start global listening:', error);
    }
  }
}

// 导出单例实例
export const baseService = BaseService.getInstance();