import { Building2, Sparkles } from 'lucide-react';
import { useCompanyBranding } from '../../contexts/CompanyBrandingContext';

interface MobileHeaderProps {
  userName: string;
  userRole?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function MobileHeader({ userName, userRole, subtitle, children }: MobileHeaderProps) {
  const { branding } = useCompanyBranding();

  const primaryColor = branding?.primary_color || '#2563eb';
  const secondaryColor = branding?.secondary_color || '#1e40af';
  const brandName = branding?.brand_name || 'Site Engineer';
  const logoUrl = branding?.logo_url;

  return (
    <div
      className="text-white px-6 py-8 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <div className="bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-xl">
              <img src={logoUrl} alt={brandName} className="h-10 object-contain drop-shadow-xl" />
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/20 shadow-xl">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hi, {userName.split(' ')[0]}</h1>
            {userRole && (
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-0.5">{userRole}</p>
            )}
          </div>
        </div>
        {children}
      </div>

      {subtitle && (
        <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-inner relative z-10 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-white/60 mt-0.5 shrink-0" />
          <p className="text-white/90 text-sm font-medium leading-relaxed">
            {subtitle}
          </p>
        </div>
      )}
    </div>
  );
}
