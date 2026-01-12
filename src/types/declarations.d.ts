// Image imports
declare module '*.png' {
    const value: string;
    export default value;
}

declare module '*.jpg' {
    const value: string;
    export default value;
}

declare module '*.jpeg' {
    const value: string;
    export default value;
}

declare module '*.svg' {
    import React from 'react';
    export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
}

// Global window extensions
interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
    gtag?: (...args: any[]) => void;
}
