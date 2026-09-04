import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  getDisplayedDurationMs,
  getDisplayedFrameGapMs,
  getUnrelatedMetricStatus,
  resetBuilderPerformanceSession,
  setBuilderPerformanceEnabled,
  setBuilderPerformancePaused,
  useBuilderPerformanceSnapshot,
} from "./builderPerformanceStore";

const STATUS_STYLES = {
  green: "bg-emerald-700 text-white",
  yellow: "bg-amber-700 text-white",
  red: "bg-red-700 text-white",
};

const formatMs = (value) =>
  Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)} ms` : "—";

const ELEMENT_TYPE_NAMES = {
  text: "Text",
  heading: "Heading",
  btn: "Button",
  btnG: "Button Dual",
  icon: "Icon",
  img: "Image",
  imgh: "Image Hover",
  imgo: "Overlay",
  bnr: "Banner",
  vid: "Video",
  lbx: "Lightbox",
  list: "List",
  crl: "Carousel",
  lstb: "List Box",
  ctn: "Counter",
  divider: "Divider",
  form: "Form",
  dts: "Data Slider",
  ctg: "Catagories",
  tbl: "Data Table",
  btw: "Between",
  tabs: "Tabs",
  acc: "Accordion",
  post: "Post",
  frmInput: "Form Input",
  frmText: "Form Text",
  frmNum: "Form Number",
  frmSum: "Form Summary",
  frmTextarea: "Form Textarea",
  frmSelect: "Form Select",
  frmRadio: "Form Radio",
  frmCheckbox: "Form Checkbox",
  frmSubmit: "Form Submit",
  "menu-item": "Menu Item",
  Menu: "Menu",
  Nav: "Nav",
  Top: "Top",
  Footer: "Footer",
};

const StatusBadge = ({ status = "green" }) => (
  <span
    className={`inline-flex items-center rounded-md border border-transparent px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
      STATUS_STYLES[status] || STATUS_STYLES.green
    }`}
  >
    {status === "red" ? "เกินมาตรฐาน" : status === "yellow" ? "เฝ้าระวัง" : "ผ่าน"}
  </span>
);

const StandardGuide = ({ standard }) => {
  const parts = String(standard || "")
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return null;

  return (
    <div className="mt-1.5 flex items-center gap-1 whitespace-nowrap">
      {parts.map((part, index) => (
        <span
          key={part}
          title={part}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[8px] text-white"
          style={{
            backgroundColor:
              parts.length === 1
                ? "rgba(51, 51, 51, 0.45)"
                : index === 0
                  ? "rgba(5, 150, 105, 0.45)"
                  : "rgba(220, 38, 38, 0.45)",
          }}
        >
          <span
            className={`h-1 w-1 rounded-full ${
              parts.length === 1
                ? "bg-white/70"
                : index === 0
                  ? "bg-white/80"
                  : "bg-white/80"
            }`}
          />
          {parts.length > 1
            ? part.replace(/^ปกติ\s*/, "").replace(/^วิกฤต\s*/, "")
            : part}
        </span>
      ))}
    </div>
  );
};

const MetricCard = ({
  label,
  value,
  standard,
  danger = false,
  labelClassName = "text-xs",
}) => (
  <div
    className={`rounded-md border px-2.5 py-2 ${
      danger ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"
    }`}
  >
    <div className={`text-[15px] font-semibold ${danger ? "text-red-700" : "text-slate-800"}`}>
      {value}
    </div>
    <div className={`mt-0.5 ${labelClassName} ${danger ? "text-red-700" : "text-slate-800"}`}>
      {label}
    </div>
    <StandardGuide standard={standard} />
  </div>
);

const DetailMetric = ({ label, value, status = "neutral", detail = "" }) => {
  const styles = {
    neutral: "border-slate-200 bg-slate-50 text-slate-600",
    green: "border-emerald-100 bg-emerald-50 text-emerald-700",
    yellow: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };
  return (
    <div className={`min-w-0 rounded-md border px-2 py-1.5 ${styles[status] || styles.neutral}`}>
      <div className="truncate text-[10px] font-medium opacity-70">{label}</div>
      <div className="mt-0.5 truncate text-xs font-semibold">{value}</div>
      {detail ? (
        <div className="mt-0.5 truncate text-[9px] opacity-60" title={detail}>
          {detail}
        </div>
      ) : null}
    </div>
  );
};

const metricStatus = (value, yellow, red) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return "neutral";
  if (numeric > red) return "red";
  if (numeric > yellow) return "yellow";
  return "green";
};

const TransactionRow = ({ transaction }) => {
  const metrics = transaction.metrics || {};
  const renderMs = metrics.renderMaxMs || metrics.panelMaxMs;
  const frameMs = getDisplayedFrameGapMs(transaction);
  const rerenders = metrics.targetRenderCount || 0;
  const unrelatedPercent = Math.round((metrics.unrelatedRenderRatio || 0) * 100);
  const isLifecycle = [
    "page-load",
    "page-switch",
    "page-save",
    "resource-load",
    "resource-save",
    "menu-switch",
  ].includes(transaction.kind);
  const primaryDuration =
    getDisplayedDurationMs(transaction) || transaction.durationMs;
  return (
    <div className="border-b border-slate-100 px-3 py-2 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[11px] font-semibold text-slate-800">
            {transaction.label}
            <span className="ml-1 font-normal text-slate-500">
              · {transaction.kind}
              {transaction.elementType ? ` · ${transaction.elementType}` : ""}
              {transaction.controlKind ? ` · ${transaction.controlKind}` : ""}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={`text-[11px] font-semibold ${
              transaction.status === "red"
                ? "text-red-700"
                : transaction.status === "yellow"
                  ? "text-amber-700"
                  : "text-slate-700"
            }`}
          >
            {formatMs(primaryDuration)}
          </span>
          <StatusBadge status={transaction.status} />
        </div>
      </div>
      {isLifecycle ? (
        <div className="mt-2 grid grid-cols-5 gap-1.5">
          <DetailMetric
            label="API · รับส่งข้อมูล"
            value={formatMs(metrics.apiLatencyMs)}
            status={
              metrics.failed
                ? "red"
                : metricStatus(metrics.apiLatencyMs, 800, 2000)
            }
          />
          <DetailMetric
            label="Total · จนแสดงผล"
            value={formatMs(metrics.lifecycleTotalMs)}
            status={
              metrics.failed
                ? "red"
                : metricStatus(metrics.lifecycleTotalMs, 1000, 2500)
            }
          />
          <DetailMetric
            label="Commit · อัปเดต UI"
            value={formatMs(metrics.canvasMaxMs)}
            status={metricStatus(metrics.canvasMaxMs, 8, 16.7)}
          />
          <DetailMetric
            label="Frame · ความลื่นไหล"
            value={formatMs(frameMs)}
            status={metricStatus(frameMs, 20, 33)}
          />
          <DetailMetric
            label="Layouts · โครงสร้าง"
            value={metrics.layoutCount || 0}
            status="neutral"
          />
        </div>
      ) : (
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        <DetailMetric
          label="Commit · อัปเดต UI"
          value={formatMs(metrics.canvasMaxMs)}
          status={metricStatus(metrics.canvasMaxMs, 8, 16.7)}
          detail={metrics.canvasMaxPhase}
        />
        <DetailMetric
          label="Render · แสดงผล"
          value={formatMs(renderMs)}
          status={metricStatus(renderMs, 8, 16.7)}
        />
        <DetailMetric
          label="Frame · ความลื่นไหล"
          value={formatMs(frameMs)}
          status={metricStatus(frameMs, 20, 33)}
        />
        <DetailMetric
          label="Re-render · แสดงซ้ำ"
          value={rerenders}
          status={metricStatus(rerenders, 2, 5)}
        />
        <DetailMetric
          label="Unrelated · นอกเป้า"
          value={`${unrelatedPercent}%`}
          status={getUnrelatedMetricStatus(transaction)}
        />
      </div>
      )}
      {metrics.canvasMaxDetails ? (
        <div
          className="mt-1 truncate pt-2 text-[9px] text-[#333333]"
          title={JSON.stringify(metrics.canvasMaxDetails)}
        >
          Cache Section H/M {metrics.canvasMaxDetails.sectionHits}/
          {metrics.canvasMaxDetails.sectionMisses} · Column H/M{" "}
          {metrics.canvasMaxDetails.columnHits}/
          {metrics.canvasMaxDetails.columnMisses} · สร้าง Column ใหม่{" "}
          {metrics.canvasMaxDetails.rebuiltColumns} · Scoped{" "}
          {metrics.canvasMaxDetails.scoped ? "ใช่" : "ไม่"}
        </div>
      ) : null}
    </div>
  );
};

const ElementRow = ({ element }) => (
  <div className="grid grid-cols-[1fr_58px_62px_72px] items-center gap-2 border-b border-slate-100 px-3 py-2 text-[10px] last:border-b-0">
    <div className="min-w-0">
      <div className="truncate font-semibold text-slate-800">
        {element.elementType}
        {ELEMENT_TYPE_NAMES[element.elementType]
          ? ` · ${ELEMENT_TYPE_NAMES[element.elementType]}`
          : ""}
      </div>
      <div className="truncate text-[9px] text-slate-400">{element.elementId}</div>
    </div>
    <div className="text-right text-slate-600">{element.renderCount}</div>
    <div
      className={`text-right font-semibold ${
        element.status === "red"
          ? "text-red-700"
          : element.status === "yellow"
            ? "text-amber-700"
            : "text-slate-700"
      }`}
    >
      {formatMs(element.maxActualMs)}
    </div>
    <div className="flex justify-end">
      <StatusBadge status={element.status} />
    </div>
  </div>
);

export const BuilderPerformanceTrigger = () => {
  const snapshot = useBuilderPerformanceSnapshot();
  if (snapshot.enabled) return null;
  return (
    <button
      type="button"
      data-performance-monitor="true"
      onClick={() => setBuilderPerformanceEnabled(true)}
      className="dash-button inline-flex shrink-0 items-center gap-1.5 rounded-md border border-transparent px-3 py-1.5 text-left text-[12px] font-medium shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2"
    >
      Performance
    </button>
  );
};

const BuilderPerformanceMonitor = () => {
  const snapshot = useBuilderPerformanceSnapshot();
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState("transactions");
  const measurePageLoad = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("builderPerf", "1");
    window.location.assign(url.toString());
  };
  const closeMonitor = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("builderPerf");
    window.history.replaceState({}, "", url.toString());
    setBuilderPerformanceEnabled(false);
  };

  const coverage = useMemo(() => {
    const elementTypes = new Set(
      snapshot.elements.map((element) => element.elementType).filter(Boolean)
    );
    const interactions = new Set(
      snapshot.transactions
        .map((transaction) => transaction.kind)
        .filter(Boolean)
    );
    const panelTypes = new Set(
      snapshot.transactions
        .map((transaction) => transaction.panelType)
        .filter(Boolean)
    );
    return {
      elementTypes: elementTypes.size,
      interactions: interactions.size,
      panelTypes: panelTypes.size,
    };
  }, [snapshot.elements, snapshot.transactions]);

  if (typeof document === "undefined") return null;

  if (!snapshot.enabled) return null;

  return createPortal(
    <div
      data-performance-monitor="true"
      className={`fixed bottom-[49px] left-1/2 z-[10000] flex -translate-x-1/2 flex-col overflow-hidden rounded-t-lg border border-slate-300 bg-white text-slate-900 shadow-none ${
        collapsed
          ? "w-[260px]"
          : "max-h-[min(90vh,750px)] w-[min(94vw,760px)]"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-900 px-3 py-2 text-white">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold">Builder Performance Monitor</span>
            <span className="text-[9px] font-normal text-slate-300">
              Memory only · ไม่ส่งข้อมูล · {snapshot.activeCount} active
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={measurePageLoad}
          className="rounded bg-slate-700 px-2 py-1 text-[10px] text-slate-100"
          title="โหลดหน้านี้ใหม่และเริ่มวัดตั้งแต่ Builder เริ่มโหลด"
        >
          วัด Load
        </button>
        <button
          type="button"
          onClick={() => setBuilderPerformancePaused(!snapshot.paused)}
          className={`rounded px-2 py-1 text-[10px] ${
            snapshot.paused ? "bg-amber-500 text-white" : "bg-slate-700 text-slate-100"
          }`}
        >
          {snapshot.paused ? "ทำต่อ" : "พัก"}
        </button>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="rounded bg-slate-700 px-2 py-1 text-[10px] text-slate-100"
        >
          {collapsed ? "เปิด" : "ย่อ"}
        </button>
        <button
          type="button"
          onClick={closeMonitor}
          className="rounded bg-slate-700 px-2 py-1 text-[10px] text-slate-100"
        >
          ปิด
        </button>
      </div>

      {!collapsed ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="grid grid-cols-5 gap-2 border-b border-slate-200 p-3">
            <MetricCard
              label="Interaction สูงสุด"
              value={formatMs(snapshot.summary.maxInteractionMs)}
              standard="ปกติ ≤ 100 ms · วิกฤต > 200 ms"
              danger={snapshot.summary.maxInteractionMs > 200}
            />
            <MetricCard
              label="Commit สูงสุด"
              value={formatMs(snapshot.summary.maxCommitMs)}
              standard="ปกติ ≤ 8 ms · วิกฤต > 16.7 ms"
              danger={snapshot.summary.maxCommitMs > 16.7}
            />
            <MetricCard
              label="Frame gap สูงสุด"
              value={formatMs(snapshot.summary.maxFrameGapMs)}
              standard="ปกติ ≤ 20 ms · วิกฤต > 33 ms"
              danger={snapshot.summary.maxFrameGapMs > 33}
            />
            <MetricCard
              label="Re-render สูงสุด"
              value={snapshot.summary.maxTargetRenderCount}
              standard="ปกติ ≤ 2 ครั้ง · วิกฤต > 5 ครั้ง"
              danger={snapshot.summary.maxTargetRenderCount > 5}
            />
            <MetricCard
              label="รายการสีแดง"
              value={snapshot.summary.redTransactions}
              standard={
                snapshot.summary.redTransactions > 0
                  ? `เกินเป้าหมาย ${snapshot.summary.redTransactions} รายการ`
                  : "ตามเป้าหมาย 0 รายการ"
              }
              danger={snapshot.summary.redTransactions > 0}
            />
          </div>

          <div className="flex items-center gap-1 border-b border-slate-200 px-3 py-2">
            {[
              ["transactions", "Interactions"],
              ["elements", "Elements"],
              ["coverage", "Coverage"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => setTab(value)}
                className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                  tab === value
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={resetBuilderPerformanceSession}
              className="ml-auto rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white"
            >
              Reset
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === "transactions" ? (
              snapshot.transactions.length > 0 ? (
                snapshot.transactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  รอการสั่งทดสอบจากคุณ
                </div>
              )
            ) : null}

            {tab === "elements" ? (
              <>
                <div className="grid grid-cols-[1fr_58px_62px_72px] gap-2 border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-[9px] font-semibold text-slate-500">
                  <span>Element</span>
                  <span className="text-right">Renders</span>
                  <span className="text-right">Max</span>
                  <span className="text-right">Status</span>
                </div>
                {snapshot.elements.length > 0 ? (
                  snapshot.elements.map((element) => (
                    <ElementRow key={element.key} element={element} />
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">
                    ยังไม่มี Element ที่ถูกวัด
                  </div>
                )}
              </>
            ) : null}

            {tab === "coverage" ? (
              <div className="space-y-3 p-3">
                <div className="grid grid-cols-3 gap-2">
                  <MetricCard label="Element types · ชนิด Element" value={coverage.elementTypes} labelClassName="text-[11px]" />
                  <MetricCard label="Interaction types · รูปแบบการใช้งาน" value={coverage.interactions} labelClassName="text-[11px]" />
                  <MetricCard label="Panel types · ชนิด Panel" value={coverage.panelTypes} labelClassName="text-[11px]" />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>,
    document.body
  );
};

export default BuilderPerformanceMonitor;
