import { message, ConfigProvider } from 'antd';
import { useMemo } from 'react';

/**
 * useCenteredMessage Hook
 * 
 * A wrapper around Ant Design's message.useMessage() that forces notifications
 * to appear in the top-center of the screen. This is particularly useful for
 * overcoming RTL layout defaults that might push messages to the top-right.
 * 
 * Usage:
 * const [messageApi, contextHolder] = useCenteredMessage();
 * messageApi.success('Success!');
 * 
 * @returns {[Object, React.ReactElement]} [messageApi, contextHolder]
 */
export const useCenteredMessage = () => {
    const [api, contextHolder] = message.useMessage();

    const centeredApi = useMemo(() => ({
        ...api,
        success: (config) => {
            // Handle both string and object arguments
            const content = typeof config === 'string' ? config : config.content;
            const originalConfig = typeof config === 'object' ? config : {};

            api.success({
                ...originalConfig,
                content,
                style: { marginTop: '2vh', ...originalConfig.style },
            });
        },
        error: (config) => {
            const content = typeof config === 'string' ? config : config.content;
            const originalConfig = typeof config === 'object' ? config : {};

            api.error({
                ...originalConfig,
                content,
            });
        },
        info: (config) => {
            const content = typeof config === 'string' ? config : config.content;
            const originalConfig = typeof config === 'object' ? config : {};

            api.info({
                ...originalConfig,
                content,
            });
        },
        warning: (config) => {
            const content = typeof config === 'string' ? config : config.content;
            const originalConfig = typeof config === 'object' ? config : {};

            api.warning({
                ...originalConfig,
                content,
            });
        },
        loading: (config) => {
            const content = typeof config === 'string' ? config : config.content;
            const originalConfig = typeof config === 'object' ? config : {};

            return api.loading({
                ...originalConfig,
                content,
            });
        },
        open: (config) => {
            api.open({
                ...config,
            })
        }
    }), [api]);

    // Wrap the holder in a ConfigProvider with LTR direction to force top-center positioning
    // (Standard Ant Design behavior for LTR is centered, RTL is top-right)
    const centeredContextHolder = (
        <ConfigProvider direction="ltr">
            {contextHolder}
        </ConfigProvider>
    );

    return [centeredApi, centeredContextHolder];
};
