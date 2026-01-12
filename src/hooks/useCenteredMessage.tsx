import { message, ConfigProvider } from 'antd';
import { useMemo, ReactElement } from 'react';
import { MessageInstance } from 'antd/es/message/interface';

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
 * @returns {[MessageInstance, ReactElement]} [messageApi, contextHolder]
 */
export const useCenteredMessage = (): [MessageInstance, ReactElement] => {
    const [api, contextHolder] = message.useMessage();

    const centeredApi = useMemo(() => {
        // We create a proxy or wrapper object that matches MessageInstance interface
        // iterating over keys would be dynamic, but manual wrapper is safer for TS
        const wrapper: any = { ...api };

        ['success', 'error', 'info', 'warning', 'loading'].forEach((type) => {
            wrapper[type] = (config: any) => {
                const content = typeof config === 'string' ? config : config?.content;
                const originalConfig = typeof config === 'object' ? config : {};

                // Add custom style for centering if needed, though ConfigProvider below does heavy lifting
                const style = type === 'success' ? { marginTop: '2vh', ...originalConfig.style } : originalConfig.style;

                return api[type as keyof MessageInstance]({
                    ...originalConfig,
                    content,
                    style,
                });
            };
        });

        wrapper.open = (config: any) => api.open(config);
        wrapper.destroy = (key?: any) => api.destroy(key);

        return wrapper as MessageInstance;
    }, [api]);

    // Wrap the holder in a ConfigProvider with LTR direction to force top-center positioning
    // (Standard Ant Design behavior for LTR is centered, RTL is top-right)
    const centeredContextHolder = (
        <ConfigProvider direction="ltr">
            {contextHolder}
        </ConfigProvider>
    );

    return [centeredApi, centeredContextHolder];
};
