import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Button, message, Modal } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { getMaterials } from '../api';
import { usePagination } from '../hooks/usePagination';

interface MaterialItem {
  id: number;
  lawcase_id: number;
  name: string;
  create_date: number;
  update_date: number;
  content: string;
  remark: string;
}

const L1WoldDetail: React.FC = () => {
  const { id } = useParams();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const { pagination, pagedData, setPagination } = usePagination(materials);

  const fetchMaterials = async (id: string) => {
    setLoading(true);
    try {
      const res = await getMaterials(id, 1);
      setMaterials(res.data.list);
    } catch (error) {
      message.error('获取L1 BP报告列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMaterials(id);
    }
  }, [id]);

  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'create_date',
      key: 'create_date',
      width: 300,
      render: (val: number) => new Date(val * 1000).toLocaleString()
    },
    {
      title: '更新时间',
      dataIndex: 'update_date',
      key: 'update_date',
      width: 300,
      render: (val: number) => new Date(val * 1000).toLocaleString()
    },
    {
      title: '',
      key: 'action',
      render: (_: any, record: MaterialItem) => (
        <Button
          size="small"
          onClick={() => {
            setPreviewContent(record.content || '无内容');
            setPreviewVisible(true);
          }}
        >
          查看
        </Button>
      )
    }
  ];

  return (
    <div className="page-container">
      <Card
        title="L1 BP报告信息"
        extra={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button icon={<ReloadOutlined />} onClick={() => {
              if (id) {
                fetchMaterials(id);
              }
            }}>刷新</Button>
          </div>
        }
      >
        <Modal
          open={previewVisible}
          title="内容预览"
          footer={null}
          onCancel={() => setPreviewVisible(false)}
          width={1000}
        >
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '80vh', overflow: 'auto' }}>
            {previewContent}
          </pre>
        </Modal>

        <Table
          columns={columns}
          dataSource={pagedData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: materials.length,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条数据`,
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

export default L1WoldDetail;