import type { DownloadResult, MultiDownloadResult } from '../types';

/**
 * 文件下载工具集合
 * 说明：本文件仅处理浏览器端下载，不做任何业务变更。
 * 保持纯函数式返回结构，避免副作用，便于后续扩展并行策略。
 */

/**
 * 下载单个文件
 * 就像从网上下载一个文件到电脑里
 */
/**
 * 下载单个文件（HTTP/HTTPS）
 * - 输入：`url` 必须以 http(s) 开头
 * - 输出：`DownloadResult`（成功时包含 `File`）
 * - 不抛异常，统一以错误文本返回，保证调用方稳定性
 */
export async function downloadFile(url: string): Promise<DownloadResult> {
  try {
    // 验证URL格式
    if (!url || typeof url !== 'string') {
      return {
        success: false,
        error: 'URL不能为空'
      };
    }

    // 检查URL协议
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return {
        success: false,
        error: 'URL必须以http://或https://开头'
      };
    }

    console.log('开始下载文件:', url);

    // 使用fetch下载文件
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        error: `下载失败: HTTP ${response.status} ${response.statusText}`
      };
    }

    // 获取文件内容
    const blob = await response.blob();
    
    if (blob.size === 0) {
      return {
        success: false,
        error: '下载的文件为空'
      };
    }

    // 获取文件名
    let filename = getFilenameFromUrl(url);
    
    // 如果从URL无法获取文件名，尝试从响应头获取
    if (!filename || filename === 'unknown') {
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=(['"]?)([^'"\n]*?)\1/);
        if (filenameMatch && filenameMatch[2]) {
          filename = filenameMatch[2];
        }
      }
    }

    // 如果还是没有文件名，根据内容类型生成
    if (!filename || filename === 'unknown') {
      const contentType = response.headers.get('content-type') || '';
      const extension = getExtensionFromContentType(contentType);
      filename = `file_${Date.now()}${extension || '.bin'}`;
    }

    // 创建File对象
    const file = new File([blob], filename, {
      type: blob.type || 'application/octet-stream'
    });

    console.log('文件下载成功:', {
      filename: file.name,
      size: file.size,
      type: file.type
    });

    return {
      success: true,
      file: file
    };

  } catch (error: any) {
    console.error('下载文件时发生错误:', error);
    return {
      success: false,
      error: error.message || '下载失败'
    };
  }
}

/**
 * 批量下载多个文件（高并发）
 * 就像同时从网上下载多个文件到电脑里
 */
/**
 * 批量下载文件（分批并发）
 * - 使用 Promise.allSettled 收集每批次结果，保证失败不影响整体流程
 * - 保持输入输出稳定，不改变调用方现有逻辑
 */
export async function downloadMultipleFiles(urls: string[], maxConcurrency: number = 5): Promise<MultiDownloadResult> {
  if (!urls || urls.length === 0) {
    return {
      success: false,
      files: [],
      errors: ['没有提供URL']
    };
  }

  console.log(`开始批量下载 ${urls.length} 个文件，最大并发数: ${maxConcurrency}`);
  
  const results: DownloadResult[] = [];
  const files: File[] = [];
  const errors: string[] = [];
  
  // 分批处理，控制并发数
  for (let i = 0; i < urls.length; i += maxConcurrency) {
    const batch = urls.slice(i, i + maxConcurrency);
    console.log(`处理第 ${Math.floor(i / maxConcurrency) + 1} 批，包含 ${batch.length} 个文件`);
    
    // 并发下载当前批次的文件
    const batchPromises = batch.map(async (url, index) => {
      try {
        const result = await downloadFile(url);
        return { url, result, originalIndex: i + index };
      } catch (error: any) {
        return { 
          url, 
          result: { success: false, error: error.message || '下载失败' } as DownloadResult, 
          originalIndex: i + index 
        };
      }
    });
    
    const batchResults = await Promise.allSettled(batchPromises);
    
     // 处理批次结果
     batchResults.forEach((promiseResult, batchIndex) => {
       if (promiseResult.status === 'fulfilled') {
         const { url, result } = promiseResult.value;
         results.push(result);
         
         if (result.success && result.file) {
           files.push(result.file);
         } else {
           errors.push(`${url}: ${result.error || '未知错误'}`);
         }
       } else {
         const url = batch[batchIndex];
         errors.push(`${url}: ${promiseResult.reason}`);
       }
     });
  }
  
  const successCount = files.length;
  const failCount = errors.length;
  
  console.log(`批量下载完成: 成功 ${successCount} 个，失败 ${failCount} 个`);
  
  return {
    success: successCount > 0,
    files,
    errors
  };
}

/**
 * 从URL中提取文件名
 * 就像从网址中猜测文件叫什么名字
 */
/**
 * 从 URL 推断文件名（最佳努力）
 * - 若无法解析则返回 'unknown'
 */
function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || '';
    
    // 如果文件名包含扩展名，直接返回
    if (filename && filename.includes('.')) {
      return filename;
    }
    
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * 根据Content-Type获取文件扩展名
 * 就像根据文件类型猜测应该用什么后缀名
 */
/**
 * 依据 Content-Type 映射文件扩展名（常见类型）
 * - 未匹配时返回空字符串，由上层逻辑兜底生成扩展名
 */
function getExtensionFromContentType(contentType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/bmp': '.bmp',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'application/json': '.json',
    'application/xml': '.xml',
    'text/xml': '.xml',
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar',
    'application/x-7z-compressed': '.7z'
  };

  const mainType = contentType.split(';')[0].toLowerCase();
  return mimeToExt[mainType] || '';
}