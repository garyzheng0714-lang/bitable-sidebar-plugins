// 添加 window.bitable 的类型声明，避免 TS 报错
declare global {
  interface Window {
    bitable?: any;
  }
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'antd/dist/reset.css';
import './assets/main.css';

// 本地开发环境模拟bitable对象
if (typeof window !== 'undefined' && !window.bitable) {
  console.warn('本地开发环境：模拟bitable对象');
  
  // 模拟记录数据
  const mockRecords = Array.from({ length: 1527 }, (_, i) => ({
    recordId: `rec${i.toString().padStart(8, '0')}`,
    fields: {
      'fld14elky7': i % 3 === 0 ? [
        {
          type: 'url',
          text: `https://example.com/file${i}.pdf`,
          link: `https://example.com/file${i}.pdf`
        }
      ] : [], // URL字段返回数组格式，与真实环境一致
      'fldYcTThLl': [] // 附件字段
    }
  }));
  
  // 设置第一条记录ID为测试中使用的ID
  mockRecords[0].recordId = 'rec25PkCYQRNuN';
  mockRecords[0].fields['fld14elky7'] = [
    {
      type: 'url',
      text: '`https://sam-material-online-1302115363.file.myqcloud.com//sams-static/goods/5960291/bktpromotion-e2e-prod-8580472999560179713.jpg` , `https://sam-material-online-1302115363.file.myqcloud.com//sams-static/goods/448690/bktsitem-ops-prod-8640587936936431617.jpg` , `https://sam-material-online-1302115363.file.myqcloud.com//sams-static/goods/148468/bktpromotion-e2e-prod-8577832674941292545.jpg` , `https://sam-material-online-1302115363.file.myqcloud.com//sams-static/goods/464680/bktsitem-ops-prod-8633299811059019777.jpg` , `https://sam-material-online-1302115363.file.myqcloud.com//sams-static/goods/6004231/bktpromotion-e2e-prod-8601412122181480448.jpg` , `https://sam-material-online-1302115363.file.myqcloud.com//sams-static/goods/426853/bktsitem-ops-prod-8640600151760519168.jpg`',
      link: '`https://sam-material-online-1302115363.file.myqcloud.com//sams-static/goods/5960291/bktpromotion-e2e-prod-8580472999560179713.jpg` , `https://sam-material-online-1302115363.file.myqcloud.com//sams-static/goods/448690/bktsitem-ops-prod-8640587936936431617.jpg` , `https://sam-material-online-1302115363.file.myqcloud.com//sams-static/goods/148468/bktpromotion-e2e-prod-8577832674941292545.jpg` , `https://sam-material-online-1302115363.file.myqcloud.com//sams-static/goods/464680/bktsitem-ops-prod-8633299811059019777.jpg` , `https://sam-material-online-1302115363.file.myqcloud.com//sams-static/goods/6004231/bktpromotion-e2e-prod-8601412122181480448.jpg` , `https://sam-material-online-1302115363.file.myqcloud.com//sams-static/goods/426853/bktsitem-ops-prod-8640600151760519168.jpg`'
    }
  ];
  
  // 模拟字段对象
  const createMockField = (fieldId: string, fieldType: number) => ({
    getValue: (recordId: string) => {
      const record = mockRecords.find(r => r.recordId === recordId);
      const value = record?.fields[fieldId] || null;
      console.log(`模拟字段 ${fieldId} 获取记录 ${recordId} 的值:`, value);
      return Promise.resolve(value);
    },
    setValue: (recordId: string, value: any) => {
      const record = mockRecords.find(r => r.recordId === recordId);
      if (record) {
        // 兼容附件字段的 token 写入：如果是附件字段并且传入的是数组，做一次标准化
        if (fieldId === 'fldYcTThLl' && Array.isArray(value)) {
          const normalized = value.map((v: any) => {
            if (v && typeof v === 'object' && 'token' in v) {
              // 模拟系统内部的附件对象结构
              return {
                name: v.name || `file_${Date.now()}`,
                size: v.size || 0,
                type: v.type || 'application/octet-stream',
                token: v.token,
                timeStamp: v.timeStamp || Date.now(),
              };
            }
            return v;
          });
          record.fields[fieldId] = normalized;
        } else {
          record.fields[fieldId] = value;
        }
        console.log(`模拟字段 ${fieldId} 设置记录 ${recordId} 的值:`, record.fields[fieldId]);
      }
      return Promise.resolve();
    },
    createCell: (value: any) => {
      console.log(`模拟字段 ${fieldId} 创建单元格:`, value);
      return Promise.resolve(value);
    }
  });
  
  (window as any).bitable = {
    base: {
      getActiveTable: () => Promise.resolve({
        getName: () => Promise.resolve('【采集】山姆-源数据-2025-08-21'),
        
        // 获取记录列表
        getRecordList: () => Promise.resolve({
          records: mockRecords.map(r => ({ recordId: r.recordId }))
        }),
        
        // 获取记录ID列表
        getRecordIdList: () => Promise.resolve(mockRecords.map(r => r.recordId)),
        
        // 根据ID获取记录
        getRecordById: (recordId: string) => {
          const record = mockRecords.find(r => r.recordId === recordId);
          console.log(`模拟获取记录 ${recordId}:`, record);
          return Promise.resolve(record || null);
        },
        
        // 获取字段对象
        getField: (fieldId: string) => {
          console.log(`模拟获取字段对象: ${fieldId}`);
          const fieldType = fieldId === 'fld14elky7' ? 1 : 17; // 1=URL, 17=附件
          return Promise.resolve(createMockField(fieldId, fieldType));
        },
        
        // 根据类型获取字段元数据列表
        getFieldMetaListByType: (fieldType: number) => {
          console.log(`模拟获取字段类型 ${fieldType} 的元数据列表`);
          if (fieldType === 1) { // URL字段
            return Promise.resolve([
              { id: 'fld14elky7', name: 'URL字段', type: 1 }
            ]);
          } else if (fieldType === 17) { // 附件字段
            return Promise.resolve([
              { id: 'fldYcTThLl', name: '附件字段', type: 17 }
            ]);
          }
          return Promise.resolve([]);
        },
        
        // 获取所有字段元数据
        getFieldMetaList: () => Promise.resolve([
          { id: 'fld14elky7', name: 'URL字段', type: 1 },
          { id: 'fldYcTThLl', name: '附件字段', type: 17 }
        ]),
        
        // 兼容旧方法
        getCellValue: (fieldId: string, recordId: string) => {
          const record = mockRecords.find(r => r.recordId === recordId);
          return Promise.resolve(record?.fields[fieldId] || '');
        },
        
        setCellValue: (fieldId: string, recordId: string, value: any) => {
          const record = mockRecords.find(r => r.recordId === recordId);
          if (record) {
            record.fields[fieldId] = value;
          }
          return Promise.resolve();
        }
      }),

      // 模拟批量上传文件，返回 token 数组
      batchUploadFile: async (files: File[]) => {
        console.log('模拟 batchUploadFile 调用，文件数：', files?.length);
        // 用随机 token 模拟
        return (files || []).map((_, idx) => `mock_token_${Date.now()}_${Math.random().toString(36).slice(2)}_${idx}`);
      },
    }
  };
  
  console.log('✅ 模拟bitable对象创建完成，包含', mockRecords.length, '条记录');
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      componentSize="small"
      theme={{
        token: {
          colorPrimary: '#3370ff',
          colorBgLayout: '#ffffff',
          colorText: '#1f2329',
          borderRadius: 8,
          fontSize: 13,
        },
        components: {
          Button: {
            controlHeight: 32,
            borderRadius: 6,
          },
          Card: {
            padding: 16,
            headerBg: '#ffffff',
            borderRadiusLG: 8,
          },
          Layout: {
            bodyBg: '#ffffff',
            headerBg: '#ffffff',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);