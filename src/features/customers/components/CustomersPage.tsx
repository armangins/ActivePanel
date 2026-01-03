import { useState } from 'react';
import { Layout, Input, Row, Col, Pagination, Typography, Spin, Alert, Grid, theme } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCustomersData } from '../hooks/useCustomersData';
import { CustomerCard } from './CustomerCard';
import { CustomersTable } from './CustomersTable';
import { CustomerDetailsModal } from './CustomerDetailsModal';
import { Customer } from '../types';

const { Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

export const CustomersPage = () => {
    const { t } = useLanguage();
    const { token } = theme.useToken();
    const screens = useBreakpoint();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    const { data, isLoading, error } = useCustomersData({
        page,
        per_page: 12,
        search
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleViewDetails = (customer: Customer) => {
        setSelectedCustomerId(customer.id);
    };

    // Show table on desktop (md and above), cards on mobile
    const showTable = screens.md;

    return (
        <Content>
            <div style={{ marginBottom: token.marginLG }}>
                <Title level={2}>{t('customers')}</Title>
                <Input
                    placeholder={t('searchCustomers')}
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={handleSearch}
                    style={{ maxWidth: 400 }}
                    size="large"
                />
            </div>

            {error && (
                <Alert
                    type="error"
                    message={t('errorLoadingCustomers')}
                    description={error.message}
                    style={{ marginBottom: token.marginLG }}
                />
            )}

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: token.paddingXL }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    {showTable ? (
                        <CustomersTable
                            customers={data?.data || []}
                            loading={isLoading}
                            onViewDetails={handleViewDetails}
                        />
                    ) : (
                        <Row gutter={[16, 16]}>
                            {data?.data.map((customer) => (
                                <Col xs={24} sm={12} key={customer.id}>
                                    <CustomerCard
                                        customer={customer}
                                        onClick={handleViewDetails}
                                    />
                                </Col>
                            ))}
                        </Row>
                    )}

                    {data && data.total > 0 && (
                        <div style={{ marginTop: token.marginLG, textAlign: 'center' }}>
                            <Pagination
                                current={page}
                                total={data.total}
                                pageSize={12}
                                onChange={setPage}
                                showSizeChanger={false}
                            />
                        </div>
                    )}

                    {!isLoading && (!data || data.total === 0) && (
                        <div style={{
                            textAlign: 'center',
                            color: token.colorTextSecondary,
                            marginTop: token.marginXL
                        }}>
                            {t('noCustomersFound')}
                        </div>
                    )}
                </>
            )}

            <CustomerDetailsModal
                customerId={selectedCustomerId}
                onClose={() => setSelectedCustomerId(null)}
            />
        </Content>
    );
};
