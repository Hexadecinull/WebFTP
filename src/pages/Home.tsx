import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import logo from '@/assets/logo.png';
import {
  Server, Shield, Zap, Globe, Upload, FolderTree,
  ArrowRight, Github, Terminal, FileCode, Lock
} from 'lucide-react';

const features = [
  {
    icon: Server,
    title: 'Multi-Protocol Support',
    description: 'Connect via FTP, FTPS, SFTP, SMB, WebDAV, or browse local files — all from one interface.',
  },
  {
    icon: Shield,
    title: 'Secure Transfers',
    description: 'End-to-end encrypted connections with SSH key support and secure credential storage.',
  },
  {
    icon: Zap,
    title: 'Fast & Lightweight',
    description: 'Built with modern web technologies for blazing-fast file browsing and transfers.',
  },
  {
    icon: FolderTree,
    title: 'Full File Management',
    description: 'Create, rename, move, delete files and folders. Edit code with syntax highlighting.',
  },
  {
    icon: Upload,
    title: 'Drag & Drop Uploads',
    description: 'Upload files and folders by simply dragging them into the browser window.',
  },
  {
    icon: Globe,
    title: 'Access Anywhere',
    description: 'No installation needed. Access your servers from any browser on any device.',
  },
];

const protocols = [
  { name: 'FTP', desc: 'File Transfer Protocol' },
  { name: 'FTPS', desc: 'FTP over TLS/SSL' },
  { name: 'SFTP', desc: 'SSH File Transfer' },
  { name: 'SMB', desc: 'Windows Shares' },
  { name: 'WebDAV', desc: 'Web Distributed Authoring' },
  { name: 'Local', desc: 'Local File System' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="WebFTP" className="h-8 w-8" />
            <span className="text-xl font-bold">WebFTP</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Hexadecinull/WebFTP"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex"
            >
              <Button variant="ghost" size="sm">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
            </a>
            <Button onClick={() => navigate('/app')} size="sm">
              Launch App
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Terminal className="h-4 w-4" />
              Open Source File Manager
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Manage your servers
              <span className="block text-primary">from anywhere</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              A powerful, browser-based file manager that connects to your servers via FTP, SFTP, SMB, WebDAV and more.
              No installation required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" onClick={() => navigate('/app')} className="text-base px-8">
                Open WebFTP
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <a
                href="https://github.com/Hexadecinull/WebFTP"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="text-base px-8">
                  <Github className="h-5 w-5 mr-2" />
                  View Source
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Protocols */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-sm font-medium text-muted-foreground mb-6">SUPPORTED PROTOCOLS</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {protocols.map((p) => (
              <div key={p.name} className="text-center p-4 rounded-lg bg-card border border-border">
                <Lock className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground text-lg">
              A complete file management solution built for developers and system administrators.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border border-border hover:border-primary/30 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation */}
      <section className="border-t border-border bg-muted/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Quick Start Guide</h2>
            <p className="text-muted-foreground">Get connected in seconds</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { step: '1', title: 'Launch the App', desc: 'Click "Open WebFTP" to start the file manager in your browser.' },
              { step: '2', title: 'Create a Connection', desc: 'Click "New Connection" in the sidebar, enter your server hostname, port, credentials, and select a protocol.' },
              { step: '3', title: 'Browse & Manage', desc: 'Navigate directories, upload/download files, edit code, create folders, and manage your server files — all from the browser.' },
              { step: '4', title: 'Save for Later', desc: 'Sign in to save connections, bookmarks, and preferences across sessions.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Built for Power Users</h2>
            <p className="text-muted-foreground">Syntax highlighting for 30+ languages, Markdown preview, custom file icons, and more.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: FileCode, label: 'Code Editor with syntax highlighting' },
              { icon: FolderTree, label: 'Drag & drop to move files between folders' },
              { icon: Upload, label: 'Upload files & folders via drag & drop' },
              { icon: Shield, label: 'SSH key authentication support' },
              { icon: Globe, label: 'List & Grid view modes' },
              { icon: Zap, label: 'Download folders as ZIP, TAR, or 7Z' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                <item.icon className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Launch WebFTP and connect to your servers in seconds. No downloads, no setup — just open and go.
          </p>
          <Button size="lg" onClick={() => navigate('/app')} className="text-base px-8">
            Launch WebFTP
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={logo} alt="WebFTP" className="h-5 w-5" />
            <span>WebFTP — Open Source File Manager</span>
          </div>
          <a
            href="https://github.com/Hexadecinull/WebFTP"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
