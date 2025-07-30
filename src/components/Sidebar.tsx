import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  Image, 
  History, 
  Heart, 
  User, 
  ChevronDown, 
  Sparkles,
  Edit3,
  Maximize,
  Layers,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  const [imageExpanded, setImageExpanded] = useState(true);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="w-64 bg-sidebar-background border-r border-sidebar-border h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="font-semibold text-foreground">FLUX Playground</h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-3 space-y-1">
        {/* Image Section */}
        <div>
          <Button
            variant="ghost"
            onClick={() => setImageExpanded(!imageExpanded)}
            className="w-full justify-between flux-sidebar-item text-sidebar-foreground hover:text-foreground"
          >
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span>Image</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${imageExpanded ? 'rotate-180' : ''}`} />
          </Button>
          
          {imageExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              <Button
                variant="ghost"
                onClick={() => onSectionChange('generate')}
                className={`w-full justify-start text-sm ${
                  activeSection === 'generate' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-sidebar-foreground hover:text-foreground'
                }`}
              >
                Generate
              </Button>
              <Button
                variant="ghost"
                onClick={() => onSectionChange('edit')}
                className={`w-full justify-start text-sm ${
                  activeSection === 'edit' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-sidebar-foreground hover:text-foreground'
                }`}
              >
                <Edit3 className="h-3 w-3 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                onClick={() => onSectionChange('fill')}
                className={`w-full justify-start text-sm ${
                  activeSection === 'fill' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-sidebar-foreground hover:text-foreground'
                }`}
              >
                <Layers className="h-3 w-3 mr-2" />
                Fill
              </Button>
              <Button
                variant="ghost"
                onClick={() => onSectionChange('expand')}
                className={`w-full justify-start text-sm ${
                  activeSection === 'expand' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-sidebar-foreground hover:text-foreground'
                }`}
              >
                <Maximize className="h-3 w-3 mr-2" />
                Expand
              </Button>
            </div>
          )}
        </div>

        {/* Other Sections */}
        <Button
          variant="ghost"
          onClick={() => onSectionChange('history')}
          className={`flux-sidebar-item ${
            activeSection === 'history' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:text-foreground'
          }`}
        >
          <History className="h-4 w-4" />
          <span>History</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => onSectionChange('favorites')}
          className={`flux-sidebar-item ${
            activeSection === 'favorites' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:text-foreground'
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>Favorites</span>
        </Button>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Button
          variant="ghost"
          onClick={() => onSectionChange('account')}
          className={`flux-sidebar-item ${
            activeSection === 'account' 
              ? 'bg-primary text-primary-foreground' 
              : 'text-sidebar-foreground hover:text-foreground'
          }`}
        >
          <User className="h-4 w-4" />
          <span>My account</span>
        </Button>
        
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="flux-sidebar-item text-sidebar-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
