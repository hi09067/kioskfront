import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ // PWA 를 위해 새로 추가
      registerType: 'autoUpdate',  // 서비스워커 자동 업데이트
      manifest: {
        name: '내 앱 이름',
        short_name: '내앱',
        description: '내 React Vite PWA 앱',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',  // public 폴더에 아이콘 파일 위치
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Workbox 캐싱 옵션 설정 가능
      }
    })
  ],
});
