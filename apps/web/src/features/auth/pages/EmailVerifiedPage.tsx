import { Link } from '@tanstack/react-router'
import { AuthCard } from '@/features/auth/components/AuthCard'

const EmailVerifiedPage = () => {
    return (
        <AuthCard title="Email verified" description="Your account is ready to go.">
            <Link to="/" className="text-sm underline">
                Continue to ViteNest
            </Link>
        </AuthCard>
    )
}

export default EmailVerifiedPage
