/**
 * Icon Mappings
 * 
 * Maps Heroicons to Ant Design Icons for easier migration
 * This file helps with the transition from @heroicons/react to @ant-design/icons
 */

import {
  // Navigation & Layout
  MenuOutlined,
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  HomeOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  SettingOutlined,
  DollarOutlined,
  FolderOutlined,
  UploadOutlined,
  
  // Actions
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  SearchOutlined,
  FilterOutlined,
  RefreshCwOutlined,
  CheckCircleOutlined,
  XCircleOutlined,
  ExclamationCircleOutlined,
  InformationCircleOutlined,
  
  // Status & Indicators
  BellOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LoadingOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  
  // Content
  FileTextOutlined,
  ImageOutlined,
  LinkOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  
  // Arrows & Navigation
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  LeftOutlined as ChevronLeftOutlined,
  RightOutlined as ChevronRightOutlined,
  
  // Other
  CalculatorOutlined,
  BarChartOutlined,
  PieChartOutlined,
  GlobalOutlined,
  KeyOutlined,
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  GiftOutlined,
  TagOutlined,
  TagsOutlined,
  InboxOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

/**
 * Common icon mappings from Heroicons to Ant Design Icons
 * Format: 'HeroiconName': AntDesignIcon
 */
export const iconMap = {
  // Navigation
  'Bars3Icon': MenuOutlined,
  'MenuIcon': MenuOutlined,
  'XMarkIcon': CloseOutlined,
  'XIcon': CloseOutlined,
  'ChevronLeftIcon': ChevronLeftOutlined,
  'ChevronRightIcon': ChevronRightOutlined,
  'ArrowLeftIcon': ArrowLeftOutlined,
  'ArrowRightIcon': ArrowRightOutlined,
  'ArrowUpIcon': ArrowUpOutlined,
  'ArrowDownIcon': ArrowDownOutlined,
  
  // Common Actions
  'PlusIcon': PlusOutlined,
  'PencilIcon': EditOutlined,
  'PencilSquareIcon': EditOutlined,
  'TrashIcon': DeleteOutlined,
  'DocumentArrowDownIcon': SaveOutlined,
  'MagnifyingGlassIcon': SearchOutlined,
  'FunnelIcon': FilterOutlined,
  'ArrowPathIcon': RefreshCwOutlined,
  
  // Status
  'CheckCircleIcon': CheckCircleOutlined,
  'XCircleIcon': XCircleOutlined,
  'ExclamationCircleIcon': ExclamationCircleOutlined,
  'InformationCircleIcon': InformationCircleOutlined,
  
  // UI Elements
  'BellIcon': BellOutlined,
  'EyeIcon': EyeOutlined,
  'EyeSlashIcon': EyeInvisibleOutlined,
  'PhotoIcon': ImageOutlined,
  'CubeIcon': InboxOutlined,
  'FolderIcon': FolderOutlined,
  
  // Features
  'CalculatorIcon': CalculatorOutlined,
  'ChartBarIcon': BarChartOutlined,
  'GlobeAltIcon': GlobalOutlined,
  'KeyIcon': KeyOutlined,
  'LockClosedIcon': LockOutlined,
  'LockOpenIcon': UnlockOutlined,
  'EnvelopeIcon': MailOutlined,
  'PhoneIcon': PhoneOutlined,
  'MapPinIcon': EnvironmentOutlined,
  'CreditCardIcon': CreditCardOutlined,
  'GiftIcon': GiftOutlined,
  'TagIcon': TagOutlined,
  'SparklesIcon': ThunderboltOutlined,
  'CircleStackIcon': DatabaseOutlined,
  'QuestionMarkCircleIcon': QuestionCircleOutlined,
  'BookOpenIcon': BookOutlined,
  
  // Shopping
  'ShoppingBagIcon': ShoppingOutlined,
  'ShoppingCartIcon': ShoppingCartOutlined,
  'UserIcon': UserOutlined,
  'UsersIcon': UserOutlined,
  'SettingsIcon': SettingOutlined,
  'BadgeDollarIcon': DollarOutlined,
  'UploadIcon': UploadOutlined,
};

/**
 * Get Ant Design icon from Heroicon name
 * @param {string} heroiconName - Name of the Heroicon
 * @returns {React.Component} Ant Design icon component
 */
export const getAntdIcon = (heroiconName) => {
  return iconMap[heroiconName] || InboxOutlined; // Default fallback
};

/**
 * Replace Heroicon import with Ant Design icon
 * Usage: Replace `import { XMarkIcon } from '@heroicons/react/24/outline'`
 * with: `import { CloseOutlined as XMarkIcon } from '@ant-design/icons'`
 */
export default iconMap;


