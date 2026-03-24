/**
 * 字段选择组件（多组映射）
 * 说明：负责选择 URL 字段、附件字段与分隔符；保持纯展示与事件回调，不做数据写入。
 */
import React from 'react';
import { Select, Space, Input, Radio, Row, Col, Button } from 'antd';
import type { FieldSelection, FieldOption, FieldGroup } from '../types';

interface FieldSelectorProps {
  urlFields: FieldOption[];
  attachmentFields: FieldOption[];
  fieldSelection: FieldSelection;
  onFieldSelectionChange: (selection: FieldSelection) => void;
  disabled?: boolean;
}

const FieldSelector: React.FC<FieldSelectorProps> = ({
  urlFields,
  attachmentFields,
  fieldSelection,
  onFieldSelectionChange,
  disabled = false
}) => {
  const handleUrlFieldChange = (index: number, value: string) => {
    const groups = fieldSelection.groups.slice();
    groups[index] = { ...groups[index], urlFieldId: value };
    onFieldSelectionChange({ ...fieldSelection, groups });
  };

  const handleAttachmentFieldChange = (index: number, value: string) => {
    const groups = fieldSelection.groups.slice();
    groups[index] = { ...groups[index], attachmentFieldId: value };
    onFieldSelectionChange({ ...fieldSelection, groups });
  };

  const handleSeparatorChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const groups = fieldSelection.groups.slice();
    groups[index] = { ...groups[index], separator: e.target.value };
    onFieldSelectionChange({ ...fieldSelection, groups });
  };

  const handleOverwriteModeChange = (value: boolean) => {
    onFieldSelectionChange({
      ...fieldSelection,
      overwriteMode: value
    });
  };

  const handleAddGroup = () => {
    const last = fieldSelection.groups[fieldSelection.groups.length - 1] || { urlFieldId: null, attachmentFieldId: null, separator: ',' };
    const newGroup: FieldGroup = { ...last };
    onFieldSelectionChange({
      ...fieldSelection,
      groups: [...fieldSelection.groups, newGroup]
    });
  };

  const handleRemoveGroup = (index: number) => {
    const next = fieldSelection.groups.filter((_, i) => i !== index);
    onFieldSelectionChange({
      ...fieldSelection,
      groups: next.length ? next : [{ urlFieldId: null, attachmentFieldId: null, separator: ',' }]
    });
  };

  // 替换原有 Typography.Text + span 的标签渲染，统一黑色
  const label = (text: string, required?: boolean) => (
    <div style={{ color: '#000', fontSize: 14, lineHeight: '22px' }}>
      {text}
      {required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}
    </div>
  );

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      {/* 顶部工具栏：仅保留追加/覆盖切换 */}
      <div className="selector-toolbar" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
        <Radio.Group
          value={fieldSelection.overwriteMode}
          onChange={(e) => handleOverwriteModeChange(e.target.value)}
          disabled={disabled}
          optionType="button"
          buttonStyle="solid"
          size="small"
          style={{ whiteSpace: 'nowrap' }}
        >
          <Radio.Button value={false}>追加</Radio.Button>
          <Radio.Button value={true}>覆盖</Radio.Button>
        </Radio.Group>
      </div>
      {fieldSelection.groups.map((group, index) => (
        <Row key={index} gutter={[10, 10]} align="top">
          <Col xs={24} md={12}>
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              {label(`链接字段与分隔符（第${index + 1}组）`, true)}
              <div className="col-row left-row" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Select
                  size="middle"
                  placeholder="选择链接字段"
                  value={group.urlFieldId as any}
                  options={urlFields}
                  onChange={(val) => handleUrlFieldChange(index, val)}
                  disabled={disabled}
                  style={{ flex: '1 1 auto', minWidth: 160 }}
                />
                <Input
                  size="middle"
                  placeholder="输入URL分隔符，如逗号、分号等"
                  value={group.separator}
                  onChange={(e) => handleSeparatorChange(index, e)}
                  disabled={disabled}
                  style={{ flex: '0 0 180px' }}
                />
              </div>
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              {label('附件字段与操作', true)}
              <div className="col-row right-row" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Select
                  size="middle"
                  placeholder="选择待填入的附件字段"
                  value={group.attachmentFieldId as any}
                  options={attachmentFields}
                  onChange={(val) => handleAttachmentFieldChange(index, val)}
                  disabled={disabled}
                  style={{ flex: '1 1 auto', minWidth: 160 }}
                />
                <Button size="small" danger type="text" onClick={() => handleRemoveGroup(index)} disabled={disabled}>
                  删除
                </Button>
              </div>
            </Space>
          </Col>
        </Row>
      ))}

      {/* 底部：添加一组按钮 */}
      <div className="selector-bottom" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: 8 }}>
        <Button type="dashed" onClick={handleAddGroup} disabled={disabled}>
          添加一组
        </Button>
      </div>
    </Space>
  );
};

export default FieldSelector;