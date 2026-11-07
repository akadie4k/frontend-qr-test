"use client";

import { config, type IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faLine, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { faClock, faCopy } from "@fortawesome/free-regular-svg-icons";
import {
  faArrowLeft,
  faArrowPointer,
  faArrowUpRightFromSquare,
  faBan,
  faChartSimple,
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircleExclamation,
  faDownload,
  faLink,
  faList,
  faPaw,
  faPlus,
  faQrcode,
  faRotateRight,
  faShareNodes,
  faWandMagicSparkles,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

// CSS is imported once in app/layout.tsx — stop FA injecting it at runtime.
config.autoAddCss = false;

interface IconProps {
  size?: number;
  className?: string;
  spin?: boolean;
}

function make(icon: IconDefinition, name: string) {
  function Icon({ size = 18, className, spin }: IconProps) {
    return (
      <FontAwesomeIcon
        icon={icon}
        spin={spin}
        className={className}
        style={{ width: size, height: size }}
        aria-hidden="true"
        focusable="false"
      />
    );
  }
  Icon.displayName = name;
  return Icon;
}

export const LinkIcon = make(faLink, "LinkIcon");
export const CopyIcon = make(faCopy, "CopyIcon");
export const CheckIcon = make(faCheck, "CheckIcon");
export const DownloadIcon = make(faDownload, "DownloadIcon");
export const ExternalIcon = make(faArrowUpRightFromSquare, "ExternalIcon");
export const QrIcon = make(faQrcode, "QrIcon");
export const ListIcon = make(faList, "ListIcon");
export const RefreshIcon = make(faRotateRight, "RefreshIcon");
export const ChevronLeft = make(faChevronLeft, "ChevronLeft");
export const ChevronRight = make(faChevronRight, "ChevronRight");
export const ChevronDown = make(faChevronDown, "ChevronDown");
export const ArrowLeft = make(faArrowLeft, "ArrowLeft");
export const ClickIcon = make(faArrowPointer, "ClickIcon");
export const ClockIcon = make(faClock, "ClockIcon");
export const SparkleIcon = make(faWandMagicSparkles, "SparkleIcon");
export const XIcon = make(faXmark, "XIcon");
export const AlertIcon = make(faCircleExclamation, "AlertIcon");
export const PlusIcon = make(faPlus, "PlusIcon");
export const ChartIcon = make(faChartSimple, "ChartIcon");
export const PawIcon = make(faPaw, "PawIcon");
export const BanIcon = make(faBan, "BanIcon");
export const ShareIcon = make(faShareNodes, "ShareIcon");
export const LineIcon = make(faLine, "LineIcon");
export const FacebookIcon = make(faFacebook, "FacebookIcon");
export const XBrandIcon = make(faXTwitter, "XBrandIcon");
