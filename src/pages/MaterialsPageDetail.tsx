import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Table, Button, message, Modal, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { getMaterials, startMaterialsGeneration } from '../api';
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

const MaterialsDetailPage: React.FC = () => {
  const { id } = useParams();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const { pagination, pagedData, setPagination } = usePagination(materials);

  const fetchMaterials = async (id: string) => {
    setLoading(true);
    try {
      const res = await getMaterials(id, 0);
      setMaterials(res.data.list);
    } catch (error) {
      message.error('获取L1 BP材料列表失败');
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

  const handleStart = async () => {
    if (!id) return;
    try {
      const res = await startMaterialsGeneration(id) as any;
      if (res.code === 200) {
        message.success('L1 BP 报告撰写已启动！');
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      message.error('启动失败');
    }
  };

  const navigate = useNavigate();
  const handleViewResult = () => {
    navigate(`/l1-workflow/${id}`);
  };

  return (
    <div className="page-container">
      <Card style={{ marginBottom: 16 }} title="L1 BP 材料">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 32 }}>
          {/* 左侧：必需文件说明 */}
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 16, color: '#555', marginBottom: 18 }}>
              L1 BP 撰写材料包含以下文件：
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 0, lineHeight: 1.8 }}>
              <div>- 05 L1_services_and_pricing</div>
              <div>- 06 L1_personnel_plan</div>
              <div>- 07 L1_operation_expenses</div>
              <div>- 08 L1_sales_forecast</div>
              <div>- 09 L1_personnel_and_financial</div>
            </div>
          </div>
          {/* 右侧：生成材料提示和按钮 */}
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontSize: 15, color: '#fa8c16', marginBottom: 12, fontWeight: 500 }}>
              在确认无误之后，点击启动按钮，将自动开始 L1 BP 报告的撰写：
            </div>
            <Space>
              <Button
                type="primary"
                onClick={handleStart}
              >
                启动 L1 BP 报告撰写
              </Button>
              <Button onClick={handleViewResult}>
                查看结果
              </Button>
            </Space>
          </div>
        </div>
      </Card>

      <Card
        title="L1 BP材料信息"
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
            showTotal: (total) => `共 ${total} 条材料`,
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

export default MaterialsDetailPage;