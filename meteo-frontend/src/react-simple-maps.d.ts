declare module 'react-simple-maps' {
    import { ComponentType, SVGProps } from 'react';
  
    export interface Geography {
      rsmKey: string;
      properties: Record<string, any>;
    }
  
    export interface Geographies {
      geographies: Geography[];
    }
  
    export interface ComposableMapProps extends SVGProps<SVGSVGElement> {
      projection?: string;
      projectionConfig?: {
        scale?: number;
        center?: [number, number];
        rotate?: [number, number, number];
      };
    }
  
    export interface GeographyProps extends SVGProps<SVGPathElement> {
      geography: Geography;
      style?: {
        default?: React.CSSProperties;
        hover?: React.CSSProperties;
        pressed?: React.CSSProperties;
      };
    }
  
    export interface MarkerProps {
      coordinates: [number, number];
      children?: React.ReactNode;
    }
  
    export interface ZoomableGroupProps {
      center?: [number, number];
      zoom?: number;
      children?: React.ReactNode;
    }
  
    export const ComposableMap: ComponentType<ComposableMapProps>;
    export const Geographies: ComponentType<{
      geography: string;
      children: (data: Geographies) => React.ReactNode;
    }>;
    export const Geography: ComponentType<GeographyProps>;
    export const Marker: ComponentType<MarkerProps>;
    export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
  }