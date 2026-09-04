import * as React from 'react'
import {
  Home, Search, Bell, User, Info, AlertTriangle,
  Settings, Bold, Italic, Underline, Star, Inbox,
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Avatar, AvatarFallback, AvatarGroup } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Label } from '@/components/ui/label'
import {
  Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger,
} from '@/components/ui/menubar'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarInset, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'
import { Toaster } from '@/components/ui/sonner'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Toolbar, ToolbarSpacer } from '@/components/ui/toolbar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { BarChart, Bar, CartesianGrid, XAxis } from 'recharts'
import { useForm } from 'react-hook-form'

import { Logo } from '@/components/logo'
import { AppBar } from '@/components/app-bar'
import { BottomNavItem } from '@/components/bottom-nav-item'
import { MediaPlaceholder } from '@/components/media-placeholder'

/*
  Component gallery — one deterministic case per DLS component, mounted in
  isolation by the harness. Overlay components (dialog/sheet/drawer/popover/
  tooltip/hover-card/dropdown/alert-dialog) render in their OPEN state via
  defaultOpen so the screenshot pins the surface that matters. Everything is
  fixed data — no dates (the frozen clock also fixes Calendar's "today"),
  no randomness, no network.
*/

type Case = { render: () => React.ReactNode; layout?: 'center' | 'fill' }

const FIXED_MONTH = new Date('2025-01-01T00:00:00Z')

function FormCase() {
  const form = useForm({ defaultValues: { email: 'ada@example.com' } })
  return (
    <Form {...form}>
      <form className="w-80 space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormDescription>We'll never share it.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  )
}

const chartConfig = {
  desktop: { label: 'Desktop', color: 'var(--chart-1)' },
  mobile: { label: 'Mobile', color: 'var(--chart-2)' },
} satisfies ChartConfig
const chartData = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 173, mobile: 190 },
]

export const COMPONENT_CASES: Record<string, Case> = {
  accordion: {
    render: () => (
      <Accordion type="single" defaultValue="a" collapsible className="w-80">
        <AccordionItem value="a">
          <AccordionTrigger>What is the 2one DLS?</AccordionTrigger>
          <AccordionContent>A grayscale-founded design system with one brand accent.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>Yes — WCAG AA + APCA, audited.</AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
  alert: {
    render: () => (
      <div className="flex w-96 flex-col gap-3">
        <Alert>
          <Info />
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>Your changes were saved.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>We couldn't reach the server.</AlertDescription>
        </Alert>
      </div>
    ),
  },
  'alert-dialog': {
    render: () => (
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
  },
  'aspect-ratio': {
    render: () => (
      <div className="w-80">
        <AspectRatio ratio={16 / 9} className="rounded-lg bg-muted" />
      </div>
    ),
  },
  avatar: {
    render: () => (
      <AvatarGroup>
        <Avatar><AvatarFallback>AO</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>BL</AvatarFallback></Avatar>
        <Avatar><AvatarFallback>CW</AvatarFallback></Avatar>
      </AvatarGroup>
    ),
  },
  badge: {
    render: () => (
      <div className="flex flex-wrap gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>
    ),
  },
  breadcrumb: {
    render: () => (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="#">Projects</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Overview</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    ),
  },
  'button-group': {
    render: () => (
      <ButtonGroup>
        <Button variant="outline">Bold</Button>
        <Button variant="outline">Italic</Button>
        <Button variant="outline">Underline</Button>
      </ButtonGroup>
    ),
  },
  calendar: {
    render: () => (
      <Calendar mode="single" defaultMonth={FIXED_MONTH} selected={new Date('2025-01-15')} className="rounded-md border" />
    ),
  },
  carousel: {
    render: () => (
      <Carousel className="w-72">
        <CarouselContent>
          {[1, 2, 3].map((n) => (
            <CarouselItem key={n}>
              <MediaPlaceholder ratio={16 / 9} label={`Slide ${n}`} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    ),
  },
  chart: {
    render: () => (
      <div className="w-96">
        <ChartContainer config={chartConfig} className="h-56 w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} isAnimationActive={false} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} isAnimationActive={false} />
          </BarChart>
        </ChartContainer>
      </div>
    ),
  },
  checkbox: {
    render: () => (
      <div className="flex flex-col gap-3">
        <Label className="flex items-center gap-2"><Checkbox defaultChecked /> Accept terms</Label>
        <Label className="flex items-center gap-2"><Checkbox /> Subscribe</Label>
        <Label className="flex items-center gap-2 opacity-60"><Checkbox disabled /> Disabled</Label>
      </div>
    ),
  },
  collapsible: {
    render: () => (
      <Collapsible defaultOpen className="w-80">
        <CollapsibleTrigger asChild><Button variant="outline">Toggle details</Button></CollapsibleTrigger>
        <CollapsibleContent className="mt-2 rounded-md border p-3 text-sm text-muted-foreground">
          Details revealed here.
        </CollapsibleContent>
      </Collapsible>
    ),
  },
  command: {
    render: () => (
      <Command className="w-80 rounded-lg border">
        <CommandInput placeholder="Type a command…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem><Home />Home</CommandItem>
            <CommandItem><Search />Search</CommandItem>
            <CommandItem><Settings />Settings</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    ),
  },
  'context-menu': {
    render: () => (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-40 w-80 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          Right-click here
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Back</ContextMenuItem>
          <ContextMenuItem>Reload</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Save as…</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    ),
  },
  'dialog-open': {
    render: () => (
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite teammates</DialogTitle>
            <DialogDescription>Send an invite link to your team.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button>Send invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
  },
  drawer: {
    render: () => (
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
            <DrawerDescription>Refine the results below.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Apply</Button>
            <DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    ),
    layout: 'fill',
  },
  'dropdown-menu': {
    // modal={false} so the open menu doesn't aria-hidden the rest of the page,
    // which — with only the trigger on the page — trips aria-hidden-focus in
    // isolation. Non-modal is a valid, common dropdown configuration.
    render: () => (
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger asChild><Button variant="outline">Open menu</Button></DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem><User />Profile</DropdownMenuItem>
          <DropdownMenuItem><Settings />Settings</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  empty: {
    render: () => (
      <Empty className="w-96">
        <EmptyHeader>
          <EmptyMedia variant="icon"><Inbox /></EmptyMedia>
          <EmptyTitle>No messages</EmptyTitle>
          <EmptyDescription>When you get messages, they'll show up here.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent><Button>Refresh</Button></EmptyContent>
      </Empty>
    ),
  },
  field: {
    render: () => (
      <FieldGroup className="w-80">
        <Field>
          <FieldLabel htmlFor="f-name">Full name</FieldLabel>
          <Input id="f-name" defaultValue="Ada Lovelace" />
          <FieldDescription>As it appears on your ID.</FieldDescription>
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="f-email">Email</FieldLabel>
          <Input id="f-email" defaultValue="not-an-email" aria-invalid aria-describedby="f-email-err" />
          <FieldError id="f-email-err">Enter a valid email address.</FieldError>
        </Field>
      </FieldGroup>
    ),
  },
  form: { render: () => <FormCase /> },
  'hover-card': {
    render: () => (
      <HoverCard defaultOpen>
        <HoverCardTrigger asChild><Button variant="link">@2one</Button></HoverCardTrigger>
        <HoverCardContent>
          <div className="text-sm"><p className="font-medium">2one Solutions</p><p className="text-muted-foreground">Design systems as a service.</p></div>
        </HoverCardContent>
      </HoverCard>
    ),
  },
  input: {
    render: () => (
      <div className="flex w-80 flex-col gap-3">
        <Input placeholder="Default" defaultValue="Hello" />
        <Input placeholder="Disabled" disabled />
        <Input placeholder="Invalid" defaultValue="bad" aria-invalid />
      </div>
    ),
  },
  'input-group': {
    render: () => (
      <InputGroup className="w-80">
        <InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon>
        <InputGroupInput aria-label="Website URL" defaultValue="2one.solutions" />
      </InputGroup>
    ),
  },
  'input-otp': {
    render: () => (
      <InputOTP maxLength={6} defaultValue="123456" aria-label="One-time passcode" containerClassName="gap-2">
        <InputOTPGroup>
          {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
        </InputOTPGroup>
      </InputOTP>
    ),
  },
  item: {
    render: () => (
      <Item className="w-96 rounded-md border">
        <ItemMedia><Avatar><AvatarFallback>AO</AvatarFallback></Avatar></ItemMedia>
        <ItemContent>
          <ItemTitle>Amara Okafor</ItemTitle>
          <ItemDescription>Product designer</ItemDescription>
        </ItemContent>
        <Button size="sm" variant="outline">View</Button>
      </Item>
    ),
  },
  kbd: {
    render: () => (
      <KbdGroup>
        <Kbd>Ctrl</Kbd><Kbd>Shift</Kbd><Kbd>P</Kbd>
      </KbdGroup>
    ),
  },
  label: {
    render: () => (
      <div className="flex flex-col gap-2">
        <Label htmlFor="l-in">Workspace name</Label>
        <Input id="l-in" defaultValue="Acme" className="w-64" />
      </div>
    ),
  },
  menubar: {
    render: () => (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>New<MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Print</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu><MenubarTrigger>Edit</MenubarTrigger></MenubarMenu>
        <MenubarMenu><MenubarTrigger>View</MenubarTrigger></MenubarMenu>
      </Menubar>
    ),
  },
  'native-select': {
    render: () => (
      <NativeSelect aria-label="Plan" className="w-64" defaultValue="b">
        <NativeSelectOption value="a">Free</NativeSelectOption>
        <NativeSelectOption value="b">Team</NativeSelectOption>
        <NativeSelectOption value="c">Enterprise</NativeSelectOption>
      </NativeSelect>
    ),
  },
  'navigation-menu': {
    render: () => (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem><NavigationMenuTrigger>Products</NavigationMenuTrigger></NavigationMenuItem>
          <NavigationMenuItem><NavigationMenuLink href="#">Pricing</NavigationMenuLink></NavigationMenuItem>
          <NavigationMenuItem><NavigationMenuLink href="#">Docs</NavigationMenuLink></NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    ),
  },
  pagination: {
    render: () => (
      <Pagination>
        <PaginationContent>
          <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
          <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
          <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
          <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
          <PaginationItem><PaginationNext href="#" /></PaginationItem>
        </PaginationContent>
      </Pagination>
    ),
  },
  popover: {
    render: () => (
      <Popover defaultOpen>
        <PopoverTrigger asChild><Button variant="outline">Open popover</Button></PopoverTrigger>
        <PopoverContent>
          <p className="text-sm">Popover content with details.</p>
        </PopoverContent>
      </Popover>
    ),
  },
  progress: { render: () => <div className="w-80"><Progress value={60} aria-label="Upload progress" /></div> },
  'radio-group': {
    render: () => (
      <RadioGroup defaultValue="team" className="flex flex-col gap-3">
        <Label className="flex items-center gap-2"><RadioGroupItem value="free" /> Free</Label>
        <Label className="flex items-center gap-2"><RadioGroupItem value="team" /> Team</Label>
        <Label className="flex items-center gap-2"><RadioGroupItem value="ent" /> Enterprise</Label>
      </RadioGroup>
    ),
  },
  resizable: {
    render: () => (
      <ResizablePanelGroup direction="horizontal" className="h-40 w-96 rounded-lg border">
        <ResizablePanel defaultSize={50}><div className="flex h-full items-center justify-center text-sm">One</div></ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}><div className="flex h-full items-center justify-center text-sm">Two</div></ResizablePanel>
      </ResizablePanelGroup>
    ),
  },
  'scroll-area': {
    render: () => (
      <ScrollArea className="h-48 w-72 rounded-md border p-4">
        <div className="flex flex-col gap-2 text-sm">
          {Array.from({ length: 20 }, (_, i) => <div key={i}>Row {i + 1}</div>)}
        </div>
      </ScrollArea>
    ),
  },
  select: {
    render: () => (
      <Select defaultValue="team">
        <SelectTrigger className="w-64" aria-label="Plan"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="team">Team</SelectItem>
          <SelectItem value="ent">Enterprise</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  separator: {
    render: () => (
      <div className="w-72 text-sm">
        <p>Above</p>
        <Separator className="my-3" />
        <p>Below</p>
      </div>
    ),
  },
  sheet: {
    render: () => (
      <Sheet defaultOpen>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>Make changes to your profile here.</SheetDescription>
          </SheetHeader>
          <SheetFooter><Button>Save</Button></SheetFooter>
        </SheetContent>
      </Sheet>
    ),
    layout: 'fill',
  },
  sidebar: {
    render: () => (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader><span className="px-2 font-heading font-bold">Acme</span></SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {[{ i: <Home />, l: 'Home' }, { i: <Search />, l: 'Search' }, { i: <Bell />, l: 'Alerts' }].map((d) => (
                  <SidebarMenuItem key={d.l}>
                    <SidebarMenuButton>{d.i}<span>{d.l}</span></SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b px-4"><SidebarTrigger /><span className="font-medium">Home</span></header>
          <div className="p-6 text-sm text-muted-foreground">Content</div>
        </SidebarInset>
      </SidebarProvider>
    ),
    layout: 'fill',
  },
  skeleton: {
    render: () => (
      <div className="flex w-80 items-center gap-4">
        <Skeleton className="size-12 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    ),
  },
  slider: { render: () => <div className="w-80"><Slider defaultValue={[50]} max={100} aria-label="Volume" /></div> },
  sonner: {
    render: () => (
      <div className="flex flex-col items-center gap-3">
        <Button variant="outline">Show toast</Button>
        <p className="text-xs text-muted-foreground">Toaster mounted (toasts are imperative)</p>
        <Toaster />
      </div>
    ),
  },
  spinner: { render: () => <Spinner className="size-8" /> },
  switch: {
    render: () => (
      <div className="flex flex-col gap-3">
        <Label className="flex items-center gap-2"><Switch defaultChecked /> Notifications</Label>
        <Label className="flex items-center gap-2"><Switch /> Marketing emails</Label>
      </div>
    ),
  },
  tabs: {
    render: () => (
      <Tabs defaultValue="overview" className="w-96">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4 text-sm text-muted-foreground">Overview content.</TabsContent>
      </Tabs>
    ),
  },
  textarea: { render: () => <Textarea aria-label="Notes" className="w-80" defaultValue={'Deterministic\nmulti-line content.'} /> },
  toggle: { render: () => <Toggle aria-label="Bold" pressed><Bold /></Toggle> },
  'toggle-group': {
    render: () => (
      <ToggleGroup type="multiple" defaultValue={['bold']}>
        <ToggleGroupItem value="bold" aria-label="Bold"><Bold /></ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic"><Italic /></ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline"><Underline /></ToggleGroupItem>
      </ToggleGroup>
    ),
  },
  toolbar: {
    render: () => (
      <Toolbar className="w-96">
        <Button variant="outline" size="icon" aria-label="Bold"><Bold /></Button>
        <Button variant="outline" size="icon" aria-label="Italic"><Italic /></Button>
        <Button variant="outline" size="icon" aria-label="Star"><Star /></Button>
        <ToolbarSpacer />
        <Button size="sm">Publish</Button>
      </Toolbar>
    ),
  },
  tooltip: {
    render: () => (
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild><Button variant="outline">Hover me</Button></TooltipTrigger>
          <TooltipContent>Helpful hint</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },

  // 2one-only components
  'app-bar': {
    render: () => (
      <div className="w-full">
        <AppBar
          title="Accounts"
          brand={<><Logo variant="black" width={46} className="dark:hidden" /><Logo variant="white" width={46} className="hidden dark:block" /></>}
          trailingSlot={<Button variant="ghost" size="icon" aria-label="Settings"><Settings /></Button>}
        />
      </div>
    ),
    layout: 'fill',
  },
  'bottom-nav-item': {
    render: () => (
      <nav aria-label="Primary" className="flex w-96 rounded-lg border">
        <BottomNavItem icon={<Home />} label="Home" selected />
        <BottomNavItem icon={<Search />} label="Search" />
        <BottomNavItem icon={<Bell />} label="Alerts" />
        <BottomNavItem icon={<User />} label="Profile" />
      </nav>
    ),
  },
  logo: {
    render: () => (
      <div className="flex items-center gap-6">
        <Logo variant="black" width={120} className="dark:hidden" />
        <Logo variant="white" width={120} className="hidden dark:block" />
      </div>
    ),
  },
  'media-placeholder': {
    render: () => (
      <div className="grid w-96 grid-cols-2 gap-3">
        <MediaPlaceholder ratio={16 / 9} label="16 : 9" />
        <MediaPlaceholder ratio={1} label="Square" />
      </div>
    ),
  },
}
