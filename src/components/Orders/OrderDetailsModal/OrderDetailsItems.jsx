import { InboxOutlined as CubeIcon } from '@ant-design/icons';

/**
 * OrderDetailsItems Component
 * 
 * Displays order items in a table format with pricing information and product images.
 * 
 * @param {Object} order - Order object
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const OrderDetailsItems = ({ order, formatCurrency, isRTL, t }) => {
  const getProductImage = (item) => {
    // Try to get image from line item
    if (item.image?.src) {
      return item.image.src;
    }
    // Fallback to placeholder
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className={`text-sm font-medium text-gray-700 mb-3 ${'text-right'}`}>
        {t('orderItems')}
      </h3>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className={`py-3 px-4 text-sm font-medium text-gray-700 ${'text-right'}`}>
                {t('product') || 'Product'}
              </th>
              <th className={`py-3 px-4 text-sm font-medium text-gray-700 ${'text-right'}`}>
                {t('quantity') || 'Quantity'}
              </th>
              <th className={`py-3 px-4 text-sm font-medium text-gray-700 ${'text-right'}`}>
                {t('price')}
              </th>
              <th className={`py-3 px-4 text-sm font-medium text-gray-700 ${'text-right'}`}>
                {t('total')}
              </th>
            </tr>
          </thead>
          <tbody>
            {order.line_items?.map((item, index) => {
              const imageUrl = getProductImage(item);
              
              return (
                <tr key={index} className="border-t border-gray-200">
                  <td className={`py-3 px-4 ${'text-right'}`}>
                    <div className="flex items-center gap-3 flex-row-reverse">
                      {/* Product Image - Always appears first (left in LTR, right in RTL) */}
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      {/* Product Info - Always appears after image */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-gray-900 truncate ${'text-right'}`}>
                          {item.name}
                        </p>
                        {item.sku && (
                          <p className={`text-xs text-gray-500 ${'text-right'}`}>
                            {t('sku')}: {item.sku}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={`py-3 px-4 text-sm text-gray-700 ${'text-right'}`}>
                    {item.quantity}
                  </td>
                  <td className={`py-3 px-4 text-sm text-gray-700 ${'text-right'}`}>
                    {formatCurrency(parseFloat(item.price || 0))}
                  </td>
                  <td className={`py-3 px-4 text-sm font-medium text-gray-500 ${'text-right'}`}>
                    {formatCurrency(parseFloat(item.total || 0))}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="3" className={`py-3 px-4 text-sm font-medium text-gray-700 ${'text-right'}`}>
                {t('subtotal')}:
              </td>
              <td className={`py-3 px-4 text-sm font-medium text-gray-900 ${'text-right'}`}>
                {formatCurrency(
                  order.line_items?.reduce((sum, item) => sum + parseFloat(item.total || 0), 0) || 0
                )}
              </td>
            </tr>
            {order.shipping_total && parseFloat(order.shipping_total) > 0 && (
              <tr>
                <td colSpan="3" className={`py-3 px-4 text-sm font-medium text-gray-700 ${'text-right'}`}>
                  {t('shipping') || 'Shipping'}:
                </td>
                <td className={`py-3 px-4 text-sm font-medium text-gray-900 ${'text-right'}`}>
                  {formatCurrency(parseFloat(order.shipping_total || 0))}
                </td>
              </tr>
            )}
            <tr>
              <td colSpan="3" className={`py-3 px-4 text-sm font-medium text-gray-900 ${'text-right'}`}>
                {t('total')}:
              </td>
              <td className={`py-3 px-4 text-lg font-bold text-gray-900 ${'text-right'}`}>
                {formatCurrency(parseFloat(order.total || 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default OrderDetailsItems;

