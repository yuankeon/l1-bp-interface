import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Input, Select, message, Card, Modal } from 'antd';
import { addCase, getCaseList, type AddCaseParams } from '../api';

// 案件类型定义
export interface CaseItem {
  type: string;
  name: string;
  createdAt: string;
  remark: string;
  create_date: number;
}

const caseTypeOptions = [
  { label: 'L1', value: 'L1' },
];

const HomePage: React.FC = () => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchCaseList = async () => {
    try {
      const res = await getCaseList();
      setCases(res.data.list);
    } catch (error) {
      message.error('获取案件列表失败');
    }
  };

  useEffect(() => {
    fetchCaseList();
  }, []);

  // 新增案件
  const handleAddCase = async (values: AddCaseParams) => {
    setLoading(true);
    try {
      const res = await addCase(values) as any;
      if (res.code === 200) {
        form.resetFields();
        setModalVisible(false);
        message.success('新增案件成功');
        fetchCaseList();
      } else {
        message.error(res.msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (val: string) => caseTypeOptions.find(opt => opt.value === val)?.label || val
    },
    {
      title: '名字',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '创建时间',
      dataIndex: 'create_date',
      key: 'create_date',
      render: (val: number) => new Date(val * 1000).toLocaleString()
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark'
    }
  ];

  return (
    <div className="page-container">
      <Card title="案件列表" extra={<Button type="primary" onClick={() => setModalVisible(true)}>新增案件</Button>}>
        <Table
          columns={columns}
          dataSource={cases}
          rowKey={(record) => record.createdAt + record.name}
          pagination={false}
        />
      </Card>
      <Modal
        title="新增案件"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddCase}
        >
          <Form.Item
            name="type"
            label="类型"
            initialValue={caseTypeOptions[0].value}
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="类型">
              {caseTypeOptions.map(opt => (
                <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="名字"
            rules={[{ required: true, message: '请输入名字' }]}
          >
            <Input placeholder="名字" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input placeholder="备注" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              新增
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HomePage;