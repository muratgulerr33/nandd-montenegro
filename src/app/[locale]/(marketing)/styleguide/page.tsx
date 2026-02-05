'use client';

import { TokenGrid } from "@/components/styleguide/token-grid"
import { ThemeSwitch } from "@/components/theme/theme-switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

export default function StyleguidePage() {

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="t-h1 text-foreground">
          N-AND-D Theme / Styleguide
        </h1>
        <ThemeSwitch />
      </div>

      <Tabs defaultValue="tokens" className="w-full">
        <TabsList>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="space-y-6 mt-6">
          <div>
            <h2 className="t-h3 mb-4">Color Tokens</h2>
            <TokenGrid />
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6 mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="t-h3 mb-4">Headings</h2>
              <div className="space-y-4">
                <h1 className="t-display">Display</h1>
                <h1 className="t-h1">Heading 1</h1>
                <h2 className="t-h2">Heading 2</h2>
                <h3 className="t-h3">Heading 3</h3>
              </div>
            </div>

            <div>
              <h2 className="t-h3 mb-4">Body Text</h2>
              <div className="space-y-4">
                <p className="t-body">
                  This is a paragraph with regular text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
                <p className="t-muted">
                  This is a paragraph with muted foreground color.
                </p>
              </div>
            </div>

            <div>
              <h2 className="t-h3 mb-4">Links</h2>
              <div>
                <Button variant="link" asChild>
                  <a href="#example">This is a link button</a>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-6 mt-6">
          <div className="space-y-8">
            <div>
              <h2 className="t-h3 mb-4">Buttons</h2>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            <div>
              <h2 className="t-h3 mb-4">Inputs</h2>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="example-input">Example Input</Label>
                  <Input id="example-input" placeholder="Type something..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="example-textarea">Example Textarea</Label>
                  <Textarea id="example-textarea" placeholder="Type a message..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="focus-test">Focus Ring Test (click to focus)</Label>
                  <Input id="focus-test" placeholder="Focus me to see the ring" className="focus-visible:ring-ring/50" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="t-h3 mb-4">Cards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <Card>
                  <CardHeader>
                    <CardTitle className="t-h4">Card Title</CardTitle>
                    <CardDescription className="t-muted">Card description goes here</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="t-muted">
                      This is the card content area. You can put any content here.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="t-h4">Card with Badge</CardTitle>
                    <CardDescription className="t-muted">Example of badge usage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

