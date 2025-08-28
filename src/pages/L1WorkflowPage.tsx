import React, { useEffect, useState } from 'react';
import { Table, Button, message, Card } from 'antd';
import { getCaseList } from '../api';
import { useNavigate } from 'react-router-dom';
import { usePagination } from '../hooks/usePagination';

// 案件类型定义
export interface CaseItem {
  type: string;
  name: string;
  createdAt: string;
  remark: string;
  create_date: number;
  id: number; // 假设后端返回 id 字段
}

const L1WorkflowPage: React.FC = () => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const navigate = useNavigate();

  const { pagination, pagedData, setPagination } = usePagination(cases);

  const fetchCaseList = async () => {
    try {
      setDataLoading(true);
      const res = await getCaseList();
      setCases(res.data.list);
    } catch (error) {
      message.error('获取案件列表失败');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseList();
  }, []);

  // 表格列定义
  const columns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '名字',
      dataIndex: 'name',
      key: 'name'
    },
    {
      width: 200,
      title: '创建时间',
      dataIndex: 'create_date',
      key: 'create_date',
      render: (val: number) => new Date(val * 1000).toLocaleString()
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CaseItem) => (
        <Button style={{ padding: 0 }} type="link" onClick={() => navigate(`/l1-workflow/${record.id}`)}>
          查看
        </Button>
      )
    }
  ];

  return (
    <div className="page-container">
      <Card title="案件列表">
        <Table
          columns={columns}
          dataSource={pagedData}
          rowKey="id"
          loading={dataLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: cases.length,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条案件`,
            onChange: (page, pageSize) => {
              setPagination({
                current: page,
                pageSize: pageSize,
              });
            },
          }}
        />
      </Card>
    </div>
  );
};

export default L1WorkflowPage;