import { bitable, FieldType, ITable, IUrlField, IAttachmentField, IUrlFieldMeta, IAttachmentFieldMeta } from '@lark-base-open/js-sdk';

interface FieldOption {
  label: string;
  value: string;
}

/**
 * 多维表格 SDK 适配工具
 * 说明：封装稳定的读写接口与边界处理，不改变业务逻辑；
 * - 输入输出尽量简单明确，统一错误信息，便于调用方处理；
 * - 保持与当前实现完全兼容，后续扩展在此聚合。
 */

/**
 * 获取当前活跃的表格
 * 就像打开一本书，我们需要先找到正在看的那一页
 */
/**
 * 获取当前活跃的 Table
 * - 成功：返回 `ITable`
 * - 失败：抛出统一错误文案，便于用户定位问题
 */
export async function getActiveTable(): Promise<ITable> {
  try {
    return await bitable.base.getActiveTable();
  } catch (error) {
    throw new Error('无法获取当前表格，请确保在飞书多维表格中打开此插件');
  }
}

/**
 * 获取URL类型的字段列表
 * 就像在表格中找到所有存放网址链接的列
 */
/**
 * 获取 URL 类型字段下拉选项
 */
export async function getUrlFields(): Promise<FieldOption[]> {
  try {
    const table = await getActiveTable();
    const urlFieldMetas = await table.getFieldMetaListByType<IUrlFieldMeta>(FieldType.Url);
    
    return urlFieldMetas.map(field => ({
      label: field.name,
      value: field.id
    }));
  } catch (error) {
    console.error('获取URL字段失败:', error);
    throw new Error('获取链接字段失败，请检查表格中是否有URL类型的字段');
  }
}

/**
 * 获取附件类型的字段列表
 * 就像在表格中找到所有存放文件的列
 */
/**
 * 获取 附件 类型字段下拉选项
 */
export async function getAttachmentFields(): Promise<FieldOption[]> {
  try {
    const table = await getActiveTable();
    const attachmentFieldMetas = await table.getFieldMetaListByType<IAttachmentFieldMeta>(FieldType.Attachment);
    
    return attachmentFieldMetas.map(field => ({
      label: field.name,
      value: field.id
    }));
  } catch (error) {
    console.error('获取附件字段失败:', error);
    throw new Error('获取附件字段失败，请检查表格中是否有附件类型的字段');
  }
}

/**
 * 获取表格中所有记录的ID列表（按视图排序）
 * 就像获取表格中每一行的编号，按照当前视图的排序顺序
 */
/**
 * 获取记录ID列表（优先使用视图的有序列表）
 */
export async function getRecordIds(): Promise<string[]> {
  try {
    const table = await getActiveTable();
    
    // 尝试获取当前活跃视图的记录列表（按视图排序）
    try {
      const view = await table.getActiveView();
      if (view) {
        const recordList = await view.getVisibleRecordIdList();
        console.log(`从视图获取到 ${recordList.length} 条记录（按视图排序）`);
        return recordList;
      }
    } catch (viewError) {
      console.warn('无法从视图获取记录列表，使用表格记录列表:', viewError);
    }
    
    // 如果无法从视图获取，则使用表格的记录列表
    const recordIds = await table.getRecordIdList();
    console.log(`从表格获取到 ${recordIds.length} 条记录`);
    return recordIds;
  } catch (error) {
    console.error('获取记录列表失败:', error);
    throw new Error('获取表格记录失败');
  }
}

/**
 * 从URL字段读取链接地址
 * 就像从表格的某一行某一列中读取网址
 */
/**
 * 读取单个 URL 字段值（返回首个链接）
 */
export async function readUrlValue(recordId: string, urlFieldId: string): Promise<string | null> {
  try {
    const table = await getActiveTable();
    const urlField = await table.getField<IUrlField>(urlFieldId);
    const urlValue = await urlField.getValue(recordId);
    
    // URL字段可能返回字符串、对象或数组格式
    if (typeof urlValue === 'string') {
      return urlValue;
    } else if (urlValue && typeof urlValue === 'object') {
      // 处理数组格式：[{"type":"url","text":"...","link":"..."}]
      if (Array.isArray(urlValue) && urlValue.length > 0) {
        const firstItem = urlValue[0];
        if (firstItem && typeof firstItem === 'object' && 'link' in firstItem) {
          // 去掉可能的反引号包围
          let link = (firstItem as any).link;
          if (typeof link === 'string') {
            link = link.trim();
            // 移除开头和结尾的反引号
            if (link.startsWith('`') && link.endsWith('`')) {
              link = link.slice(1, -1).trim();
            }
            return link;
          }
        }
      }
      // 处理单个对象格式：{"link":"..."}
      else if ('link' in urlValue) {
        let link = (urlValue as any).link;
        if (typeof link === 'string') {
          link = link.trim();
          // 移除开头和结尾的反引号
          if (link.startsWith('`') && link.endsWith('`')) {
            link = link.slice(1, -1).trim();
          }
          return link;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`读取URL字段值失败 (记录ID: ${recordId}):`, error);
    return null;
  }
}

/**
 * 从URL字段读取链接地址（兼容旧版本）
 * 就像从表格的某一行某一列中读取网址
 */
/**
 * 读取单个 URL 字段值（兼容旧方法签名）
 */
export async function getUrlValue(urlFieldId: string, recordId: string): Promise<string | null> {
  try {
    const table = await getActiveTable();
    const urlField = await table.getField<IUrlField>(urlFieldId);
    const urlValue = await urlField.getValue(recordId);
    
    // URL字段可能返回字符串、对象或数组格式
    if (typeof urlValue === 'string') {
      return urlValue;
    } else if (urlValue && typeof urlValue === 'object') {
      // 处理数组格式：[{"type":"url","text":"...","link":"..."}]
      if (Array.isArray(urlValue) && urlValue.length > 0) {
        const firstItem = urlValue[0];
        if (firstItem && typeof firstItem === 'object' && 'link' in firstItem) {
          // 去掉可能的反引号包围
          let link = (firstItem as any).link;
          if (typeof link === 'string') {
            link = link.trim();
            // 移除开头和结尾的反引号
            if (link.startsWith('`') && link.endsWith('`')) {
              link = link.slice(1, -1).trim();
            }
            return link;
          }
        }
      }
      // 处理单个对象格式：{"link":"..."}
      else if ('link' in urlValue) {
        let link = (urlValue as any).link;
        if (typeof link === 'string') {
          link = link.trim();
          // 移除开头和结尾的反引号
          if (link.startsWith('`') && link.endsWith('`')) {
            link = link.slice(1, -1).trim();
          }
          return link;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error(`读取URL字段值失败 (记录ID: ${recordId}):`, error);
    return null;
  }
}

/**
 * 从URL字段读取多个链接地址（支持分隔符）
 * 就像从表格的某一行某一列中读取多个网址，用分隔符分开
 */
/**
 * 读取多个 URL（按分隔符拆分，自动清理反引号与空白）
 */
export async function readMultipleUrlValues(recordId: string, urlFieldId: string, separator: string = ','): Promise<string[]> {
  try {
    const table = await getActiveTable();
    const urlField = await table.getField<IUrlField>(urlFieldId);
    const urlValue = await urlField.getValue(recordId);
    
    let rawText = '';
    
    // URL字段可能返回字符串、对象或数组格式
    if (typeof urlValue === 'string') {
      rawText = urlValue;
    } else if (urlValue && typeof urlValue === 'object') {
      // 处理数组格式：[{"type":"url","text":"...","link":"..."}]
      if (Array.isArray(urlValue) && urlValue.length > 0) {
        const firstItem = urlValue[0];
        if (firstItem && typeof firstItem === 'object') {
          // 优先使用text字段，因为它可能包含多个URL
          if ('text' in firstItem && typeof firstItem.text === 'string') {
            rawText = firstItem.text;
          } else if ('link' in firstItem && typeof firstItem.link === 'string') {
            rawText = firstItem.link;
          }
        }
      }
      // 处理单个对象格式：{"link":"..."}
      else if ('link' in urlValue) {
        rawText = (urlValue as any).link;
      }
    }
    
    if (!rawText) {
      return [];
    }
    
    // 按分隔符分割URL
    const urls = rawText
      .split(separator)
      .map(url => {
        let cleanUrl = url.trim();
        // 移除开头和结尾的反引号
        if (cleanUrl.startsWith('`') && cleanUrl.endsWith('`')) {
          cleanUrl = cleanUrl.slice(1, -1).trim();
        }
        return cleanUrl;
      })
      .filter(url => url.length > 0 && (url.startsWith('http://') || url.startsWith('https://')));
    
    console.log(`从记录 ${recordId} 解析出 ${urls.length} 个URL:`, urls);
    return urls;
    
  } catch (error) {
    console.error(`读取多个URL字段值失败 (记录ID: ${recordId}):`, error);
    return [];
  }
}

/**
 * 将文件保存到附件字段
 * 就像把下载好的文件放到表格的某一行某一列中
 * 注意：飞书多维表格需要先上传文件获取file_token，然后使用token保存
 */

// 定义附件值的类型
export type IAttachmentValue = (File | { token: string; name: string; size: number; type: string; timeStamp: number })[];

/**
 * 保存附件到字段
 * - 优先走 batchUploadFile 获取 token 后一次性 setValue
 * - 不同模式：追加模式/覆盖模式
 * - 无行为变化，仅增加详细日志与超时保护
 */
export async function saveAttachmentValue(recordId: string, attachmentFieldId: string, files: File[], overwriteMode: boolean = false, opts?: { onProgress?: (msg: string) => void }): Promise<void> {
  try {
    const report = (msg: string) => {
      console.log(msg);
      opts?.onProgress?.(msg);
    };

    report(`saveAttachmentValue调用: recordId=${recordId}, attachmentFieldId=${attachmentFieldId}, files数量=${files.length}, 覆盖模式=${overwriteMode}`);
    report('文件详情: ' + JSON.stringify(files.map(f => ({ name: f.name, size: f.size, type: f.type }))));

    const table = await getActiveTable();
    const attachmentField = await table.getField<IAttachmentField>(attachmentFieldId);

    const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 120000): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`操作超时 (${timeoutMs}ms)`)), timeoutMs))
      ]);
    };

    // 优先使用 batchUploadFile 获取 token，再一次性 setValue
    const canBatchUpload = typeof (bitable as any)?.base?.batchUploadFile === 'function';

    // 分片上传，避免一次性上传过多导致超时
    const uploadInChunks = async (allFiles: File[], chunkSize: number = 8, chunkTimeout = 120000): Promise<string[]> => {
      const allTokens: string[] = [];
      for (let i = 0; i < allFiles.length; i += chunkSize) {
        const chunk = allFiles.slice(i, i + chunkSize);
        report(`batchUploadFile 分片上传: 第 ${Math.floor(i / chunkSize) + 1} 批，共 ${chunk.length} 个文件`);
        const tokens = await withTimeout((bitable as any).base.batchUploadFile(chunk), chunkTimeout);
        if (!Array.isArray(tokens)) throw new Error('batchUploadFile 返回结果异常');
        allTokens.push(...tokens);
      }
      return allTokens;
    };

    if (canBatchUpload) {
      report('检测到 batchUploadFile，准备先上传获取 token 再写入附件...');
      try {
        const tokens: string[] = await uploadInChunks(files, Math.min(10, Math.max(1, 8)), 180000);
        // 将 token 与原文件信息拼装为附件对象
        const now = Date.now();
        const tokenObjs = tokens.map((token, idx) => ({
          token,
          name: files[idx]?.name || `file_${idx}`,
          size: files[idx]?.size || 0,
          type: files[idx]?.type || 'application/octet-stream',
          timeStamp: now,
        }));

        if (!overwriteMode) {
          // 追加模式：读取现有附件一次，合并后一次性 setValue
          let existing: any[] = [];
          try {
            const raw = await withTimeout(attachmentField.getValue(recordId) as Promise<any[]>, 60000);
            existing = Array.isArray(raw) ? raw : [];
          } catch (e) {
            report('获取现有附件失败，按空列表处理: ' + (e as Error).message);
            existing = [];
          }

          const merged = [...existing, ...tokenObjs];
          report(`开始一次性写入（追加），总附件数: ${merged.length}`);
          await withTimeout(attachmentField.setValue(recordId, merged as any), 180000);
          report(`✅ 追加写入完成，最终总计 ${merged.length} 个附件`);
          return;
        } else {
          report(`开始一次性写入（覆盖），写入 ${tokenObjs.length} 个附件`);
          await withTimeout(attachmentField.setValue(recordId, tokenObjs as any), 180000);
          report('✅ 覆盖写入完成');
          return;
        }
      } catch (err) {
        report('batchUploadFile 调用失败，降级为 File 直传: ' + (err as Error).message);
        // 继续走降级分支
      }
    }

    // 降级策略：无法使用 batchUploadFile 或上传失败
    if (!overwriteMode) {
      // 追加模式：为避免 IOpenAttachment[] 和 File[] 混合导致 setValue 失败，改为逐个追加
      report(`降级-逐个写入（追加），待写入 ${files.length} 个文件`);
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        await withTimeout(attachmentField.setValue(recordId, f as any), 120000);
        report(`降级-已追加第 ${i + 1}/${files.length} 个文件: ${f.name}`);
      }
      report('✅ 降级-追加写入完成');
    } else {
      report(`降级-一次性写入（覆盖），写入 ${files.length} 个附件`);
      await withTimeout(attachmentField.setValue(recordId, files as any), 180000);
      report('✅ 降级-覆盖写入完成');
    }

  } catch (error) {
    console.error('saveAttachmentValue 函数执行失败:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`保存附件失败: ${errorMessage}`);
  }
}

/**
 * 将文件保存到附件字段（兼容旧版本）
 * 就像把下载好的文件放到表格的某一行某一列中
 */
/**
 * 兼容旧版本的单文件附件写入（数组包装）
 */
export async function setAttachmentValue(attachmentFieldId: string, recordId: string, file: File): Promise<void> {
  try {
    const table = await getActiveTable();
    const attachmentField = await table.getField<IAttachmentField>(attachmentFieldId);
    
    // 将文件设置到附件字段，注意需要传入数组格式
    await attachmentField.setValue(recordId, [file]);
  } catch (error) {
    console.error(`保存附件失败 (记录ID: ${recordId}):`, error);
    throw new Error(`保存附件到记录 ${recordId} 失败: ${error.message}`);
  }
}

/**
 * 检查字段是否存在
 * 就像检查表格中是否真的有这一列
 */
/**
 * 验证单组字段是否存在
 */
export async function validateFields(urlFieldId: string, attachmentFieldId: string): Promise<boolean> {
  try {
    const table = await getActiveTable();
    
    // 检查URL字段是否存在
    const urlField = await table.getField(urlFieldId);
    if (!urlField) {
      throw new Error('选择的链接字段不存在');
    }
    
    // 检查附件字段是否存在
    const attachmentField = await table.getField(attachmentFieldId);
    if (!attachmentField) {
      throw new Error('选择的附件字段不存在');
    }
    
    return true;
  } catch (error) {
    console.error('字段验证失败:', error);
    throw error;
  }
}

/**
 * 批量验证多组字段是否存在
 */
/**
 * 批量验证多组字段是否存在
 */
export async function validateFieldGroups(groups: { urlFieldId: string; attachmentFieldId: string }[]): Promise<void> {
  const table = await getActiveTable();
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const urlField = await table.getField(g.urlFieldId);
    if (!urlField) throw new Error(`第 ${i + 1} 组的链接字段不存在`);
    const attachmentField = await table.getField(g.attachmentFieldId);
    if (!attachmentField) throw new Error(`第 ${i + 1} 组的附件字段不存在`);
  }
}