// Auto-generated catalog — Astryx components (via Showcase blocks), 2one-themed.
import { Card } from "@astryxdesign/core/Card"
import { Heading } from "@astryxdesign/core/Heading"
import { Stack } from "@astryxdesign/core/Layout"
import { Component, type ReactNode } from "react"
import AppShellShowcase from "./gallery/AppShellShowcase"
import AspectRatioShowcase from "./gallery/AspectRatioShowcase"
import AvatarGroupShowcase from "./gallery/AvatarGroupShowcase"
import AvatarShowcase from "./gallery/AvatarShowcase"
import BadgeShowcase from "./gallery/BadgeShowcase"
import BannerShowcase from "./gallery/BannerShowcase"
import BlockquoteShowcase from "./gallery/BlockquoteShowcase"
import BreadcrumbsShowcase from "./gallery/BreadcrumbsShowcase"
import ButtonGroupShowcase from "./gallery/ButtonGroupShowcase"
import ButtonShowcase from "./gallery/ButtonShowcase"
import CalendarShowcase from "./gallery/CalendarShowcase"
import CardShowcase from "./gallery/CardShowcase"
import CarouselShowcase from "./gallery/CarouselShowcase"
import CenterShowcase from "./gallery/CenterShowcase"
import CheckboxInputShowcase from "./gallery/CheckboxInputShowcase"
import CheckboxListShowcase from "./gallery/CheckboxListShowcase"
import CitationShowcase from "./gallery/CitationShowcase"
import ClickableCardShowcase from "./gallery/ClickableCardShowcase"
import CodeBlockShowcase from "./gallery/CodeBlockShowcase"
import CodeShowcase from "./gallery/CodeShowcase"
import CollapsibleShowcase from "./gallery/CollapsibleShowcase"
import CommandPaletteShowcase from "./gallery/CommandPaletteShowcase"
import ContextMenuShowcase from "./gallery/ContextMenuShowcase"
import DateInputShowcase from "./gallery/DateInputShowcase"
import DateRangeInputShowcase from "./gallery/DateRangeInputShowcase"
import DateTimeInputShowcase from "./gallery/DateTimeInputShowcase"
import DialogShowcase from "./gallery/DialogShowcase"
import DividerShowcase from "./gallery/DividerShowcase"
import DropdownMenuShowcase from "./gallery/DropdownMenuShowcase"
import EmptyStateShowcase from "./gallery/EmptyStateShowcase"
import FieldShowcase from "./gallery/FieldShowcase"
import FieldStatusShowcase from "./gallery/FieldStatusShowcase"
import FileInputShowcase from "./gallery/FileInputShowcase"
import FormLayoutShowcase from "./gallery/FormLayoutShowcase"
import GridShowcase from "./gallery/GridShowcase"
import HeadingShowcase from "./gallery/HeadingShowcase"
import HoverCardShowcase from "./gallery/HoverCardShowcase"
import IconButtonShowcase from "./gallery/IconButtonShowcase"
import IconShowcase from "./gallery/IconShowcase"
import InputGroupShowcase from "./gallery/InputGroupShowcase"
import ItemShowcase from "./gallery/ItemShowcase"
import KbdShowcase from "./gallery/KbdShowcase"
import LightboxShowcase from "./gallery/LightboxShowcase"
import LinkShowcase from "./gallery/LinkShowcase"
import ListShowcase from "./gallery/ListShowcase"
import MarkdownShowcase from "./gallery/MarkdownShowcase"
import MetadataListShowcase from "./gallery/MetadataListShowcase"
import MobileNavShowcase from "./gallery/MobileNavShowcase"
import MoreMenuShowcase from "./gallery/MoreMenuShowcase"
import MultiSelectorShowcase from "./gallery/MultiSelectorShowcase"
import NumberInputShowcase from "./gallery/NumberInputShowcase"
import OverflowListShowcase from "./gallery/OverflowListShowcase"
import PopoverShowcase from "./gallery/PopoverShowcase"
import PowerSearchShowcase from "./gallery/PowerSearchShowcase"
import ProgressBarShowcase from "./gallery/ProgressBarShowcase"
import RadioListShowcase from "./gallery/RadioListShowcase"
import ResizableShowcase from "./gallery/ResizableShowcase"
import SegmentedControlShowcase from "./gallery/SegmentedControlShowcase"
import SelectableCardShowcase from "./gallery/SelectableCardShowcase"
import SelectorShowcase from "./gallery/SelectorShowcase"
import SideNavShowcase from "./gallery/SideNavShowcase"
import SkeletonShowcase from "./gallery/SkeletonShowcase"
import SliderShowcase from "./gallery/SliderShowcase"
import SpinnerShowcase from "./gallery/SpinnerShowcase"
import StatusDotShowcase from "./gallery/StatusDotShowcase"
import SwitchShowcase from "./gallery/SwitchShowcase"
import TabListShowcase from "./gallery/TabListShowcase"
import TableShowcase from "./gallery/TableShowcase"
import TextAreaShowcase from "./gallery/TextAreaShowcase"
import TextInputShowcase from "./gallery/TextInputShowcase"
import TextShowcase from "./gallery/TextShowcase"
import ThumbnailShowcase from "./gallery/ThumbnailShowcase"
import TimeInputShowcase from "./gallery/TimeInputShowcase"
import TimestampShowcase from "./gallery/TimestampShowcase"
import ToastShowcase from "./gallery/ToastShowcase"
import ToggleButtonShowcase from "./gallery/ToggleButtonShowcase"
import TokenizerShowcase from "./gallery/TokenizerShowcase"
import TooltipShowcase from "./gallery/TooltipShowcase"
import TopNavShowcase from "./gallery/TopNavShowcase"
import TreeListShowcase from "./gallery/TreeListShowcase"
import TypeaheadShowcase from "./gallery/TypeaheadShowcase"

class Errorable extends Component<{ name: string; children: ReactNode }, { err: boolean }> {
  state = { err: false }
  static getDerivedStateFromError() { return { err: true } }
  render() { return this.state.err ? <span style={{ color: "var(--color-error)" }}>⚠ {this.props.name} failed</span> : this.props.children }
}

const ENTRIES: [string, React.ComponentType][] = [
  ["AppShell", AppShellShowcase],
  ["AspectRatio", AspectRatioShowcase],
  ["AvatarGroup", AvatarGroupShowcase],
  ["Avatar", AvatarShowcase],
  ["Badge", BadgeShowcase],
  ["Banner", BannerShowcase],
  ["Blockquote", BlockquoteShowcase],
  ["Breadcrumbs", BreadcrumbsShowcase],
  ["ButtonGroup", ButtonGroupShowcase],
  ["Button", ButtonShowcase],
  ["Calendar", CalendarShowcase],
  ["Card", CardShowcase],
  ["Carousel", CarouselShowcase],
  ["Center", CenterShowcase],
  ["CheckboxInput", CheckboxInputShowcase],
  ["CheckboxList", CheckboxListShowcase],
  ["Citation", CitationShowcase],
  ["ClickableCard", ClickableCardShowcase],
  ["CodeBlock", CodeBlockShowcase],
  ["Code", CodeShowcase],
  ["Collapsible", CollapsibleShowcase],
  ["CommandPalette", CommandPaletteShowcase],
  ["ContextMenu", ContextMenuShowcase],
  ["DateInput", DateInputShowcase],
  ["DateRangeInput", DateRangeInputShowcase],
  ["DateTimeInput", DateTimeInputShowcase],
  ["Dialog", DialogShowcase],
  ["Divider", DividerShowcase],
  ["DropdownMenu", DropdownMenuShowcase],
  ["EmptyState", EmptyStateShowcase],
  ["Field", FieldShowcase],
  ["FieldStatus", FieldStatusShowcase],
  ["FileInput", FileInputShowcase],
  ["FormLayout", FormLayoutShowcase],
  ["Grid", GridShowcase],
  ["Heading", HeadingShowcase],
  ["HoverCard", HoverCardShowcase],
  ["IconButton", IconButtonShowcase],
  ["Icon", IconShowcase],
  ["InputGroup", InputGroupShowcase],
  ["Item", ItemShowcase],
  ["Kbd", KbdShowcase],
  ["Lightbox", LightboxShowcase],
  ["Link", LinkShowcase],
  ["List", ListShowcase],
  ["Markdown", MarkdownShowcase],
  ["MetadataList", MetadataListShowcase],
  ["MobileNav", MobileNavShowcase],
  ["MoreMenu", MoreMenuShowcase],
  ["MultiSelector", MultiSelectorShowcase],
  ["NumberInput", NumberInputShowcase],
  ["OverflowList", OverflowListShowcase],
  ["Popover", PopoverShowcase],
  ["PowerSearch", PowerSearchShowcase],
  ["ProgressBar", ProgressBarShowcase],
  ["RadioList", RadioListShowcase],
  ["Resizable", ResizableShowcase],
  ["SegmentedControl", SegmentedControlShowcase],
  ["SelectableCard", SelectableCardShowcase],
  ["Selector", SelectorShowcase],
  ["SideNav", SideNavShowcase],
  ["Skeleton", SkeletonShowcase],
  ["Slider", SliderShowcase],
  ["Spinner", SpinnerShowcase],
  ["StatusDot", StatusDotShowcase],
  ["Switch", SwitchShowcase],
  ["TabList", TabListShowcase],
  ["Table", TableShowcase],
  ["TextArea", TextAreaShowcase],
  ["TextInput", TextInputShowcase],
  ["Text", TextShowcase],
  ["Thumbnail", ThumbnailShowcase],
  ["TimeInput", TimeInputShowcase],
  ["Timestamp", TimestampShowcase],
  ["Toast", ToastShowcase],
  ["ToggleButton", ToggleButtonShowcase],
  ["Tokenizer", TokenizerShowcase],
  ["Tooltip", TooltipShowcase],
  ["TopNav", TopNavShowcase],
  ["TreeList", TreeListShowcase],
  ["Typeahead", TypeaheadShowcase],
]

export function Gallery() {
  return (
    <Stack direction="vertical" gap={6}>
      {ENTRIES.map(([name, C]) => (
        <Card key={name}>
          <Stack direction="vertical" gap={4} style={{ padding: 24 }}>
            <Heading level={4}>{name}</Heading>
            <Errorable name={name}><C /></Errorable>
          </Stack>
        </Card>
      ))}
    </Stack>
  )
}
