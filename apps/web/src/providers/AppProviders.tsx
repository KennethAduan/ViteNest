import React from 'react'
import ReactQueryProvider from './ReactQueryProvider'
import { NuqsAdapter } from 'nuqs/adapters/react'
import { Provider as JotaiProvider } from "jotai"
import { ThemeProvider } from './theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'

const AppProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <ReactQueryProvider>
            <NuqsAdapter>
                <JotaiProvider>
                    <ThemeProvider>
                        <TooltipProvider>{children}</TooltipProvider>
                    </ThemeProvider>
                </JotaiProvider>
            </NuqsAdapter>
        </ReactQueryProvider>
    )
}

export default AppProviders