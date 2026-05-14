import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import './index.css'
import AdminConsole from './admin/AdminConsole'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider theme={{
      token: {
        colorPrimary: '#1659CB',
        colorSuccess: '#20B249',
        colorWarning: '#F0A105',
        colorError: '#D40B00',
        borderRadius: 4,
        fontFamily: "'Inter', sans-serif",
      },
    }}>
      <AdminConsole />
    </ConfigProvider>
  </StrictMode>,
)
