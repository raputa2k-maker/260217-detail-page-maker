'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { DeviceType } from '@/types/generated';
import { DEVICE_WIDTHS } from '@/types/generated';

interface DeviceFrameProps {
  device: DeviceType;
  zoom: number;
  children: React.ReactNode;
}

/**
 * 디바이스 목업 프레임
 * 모바일(iPhone), 태블릿, 데스크톱 프레임을 시뮬레이션합니다.
 */
export default function DeviceFrame({ device, zoom, children }: DeviceFrameProps) {
  const width = DEVICE_WIDTHS[device];
  const scale = zoom / 100;

  if (device === 'desktop') {
    return (
      <div className="flex justify-center p-4">
        <div
          className="origin-top overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
          style={{
            width: `${width}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          {/* 브라우저 상단 바 */}
          <div className="flex h-8 items-center gap-2 border-b border-gray-200 bg-gray-50 px-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            <div className="ml-3 h-4 flex-1 rounded bg-gray-200" />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '80vh' }}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  if (device === 'tablet') {
    return (
      <div className="flex justify-center p-4">
        <div
          className="origin-top overflow-hidden rounded-2xl border-[3px] border-gray-800 bg-gray-800 shadow-xl"
          style={{
            width: `${width + 24}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          {/* 상단 카메라 */}
          <div className="flex h-4 items-center justify-center bg-gray-800">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-600" />
          </div>
          <div
            className="overflow-y-auto bg-white"
            style={{ width: `${width}px`, margin: '0 auto', maxHeight: '80vh' }}
          >
            {children}
          </div>
          <div className="h-3 bg-gray-800" />
        </div>
      </div>
    );
  }

  // Mobile (iPhone-style mockup)
  return (
    <div className="flex justify-center p-4">
      <div
        className="origin-top overflow-hidden rounded-[40px] border-[4px] border-gray-900 bg-gray-900 shadow-xl"
        style={{
          width: `${width + 32}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}
      >
        {/* 상단 다이내믹 아일랜드 */}
        <div className="flex h-8 items-center justify-center bg-gray-900">
          <div className="h-4 w-24 rounded-full bg-gray-800" />
        </div>
        {/* 콘텐츠 영역 */}
        <div
          className={cn('overflow-y-auto rounded-t-xl bg-white')}
          style={{
            width: `${width}px`,
            margin: '0 auto',
            maxHeight: '75vh',
          }}
        >
          {children}
        </div>
        {/* 하단 홈 인디케이터 */}
        <div className="flex h-6 items-center justify-center bg-gray-900">
          <div className="h-1 w-28 rounded-full bg-gray-600" />
        </div>
      </div>
    </div>
  );
}
