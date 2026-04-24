import { ThemeSelector } from "./theme-selector"
import { AboutSection } from "./about-section"

export function SettingsContent() {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto p-8 space-y-8 min-h-full">
        {/* Settings Sections */}
        <div className="grid gap-8 pb-8">
          {/* Theme Settings */}
          <section>
            <div className="mb-6">
              <p className="text-muted-foreground text-sm mb-6">
                Manage your application preferences and view system information.
              </p>
              <h2 className="text-xl font-medium text-foreground mb-2">Appearance</h2>
              <p className="text-sm text-muted-foreground">Customize the look and feel of your workspace.</p>
            </div>
            <ThemeSelector />
          </section>

          {/* Support Section */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-medium text-foreground mb-2">Support</h2>
              <p className="text-sm text-muted-foreground">Get help and support resources.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="text-left p-4 bg-secondary/50 rounded-md hover:bg-secondary/70 transition-colors">
                  <div className="text-sm font-medium text-foreground">Help Center</div>
                  <div className="text-xs text-muted-foreground mt-1">Browse our knowledge base</div>
                </button>
                <button className="text-left p-4 bg-secondary/50 rounded-md hover:bg-secondary/70 transition-colors">
                  <div className="text-sm font-medium text-foreground">Contact Support</div>
                  <div className="text-xs text-muted-foreground mt-1">Get in touch with our team</div>
                </button>
                <button className="text-left p-4 bg-secondary/50 rounded-md hover:bg-secondary/70 transition-colors">
                  <div className="text-sm font-medium text-foreground">Report a Bug</div>
                  <div className="text-xs text-muted-foreground mt-1">Help us improve the app</div>
                </button>
                <button className="text-left p-4 bg-secondary/50 rounded-md hover:bg-secondary/70 transition-colors">
                  <div className="text-sm font-medium text-foreground">Feature Request</div>
                  <div className="text-xs text-muted-foreground mt-1">Suggest new features</div>
                </button>
                <button className="text-left p-4 bg-secondary/50 rounded-md hover:bg-secondary/70 transition-colors">
                  <div className="text-sm font-medium text-foreground">Documentation</div>
                  <div className="text-xs text-muted-foreground mt-1">Read our user guides</div>
                </button>
                <button className="text-left p-4 bg-secondary/50 rounded-md hover:bg-secondary/70 transition-colors">
                  <div className="text-sm font-medium text-foreground">Community Forum</div>
                  <div className="text-xs text-muted-foreground mt-1">Join our community discussions</div>
                </button>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-medium text-foreground mb-2">About</h2>
              <p className="text-sm text-muted-foreground">Application information and development details.</p>
            </div>
            <AboutSection />
          </section>
        </div>
      </div>
    </div>
  )
}
