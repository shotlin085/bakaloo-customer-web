interface ShellProps {
    children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
    return (
        <div className="min-h-screen bg-[#F0EDE8]">
            <div className="mx-auto max-w-[1440px] rounded-[40px] bg-white p-4 shadow-[0_20px_50px_rgba(0,0,0,0.04)] md:p-6 lg:p-8">
                {children}
            </div>
        </div>
    )
}
