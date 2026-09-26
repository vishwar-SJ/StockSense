# StockSense | Enterprise Inventory & Supply Chain Intelligence

**StockSense** is a modular, real-time Inventory Management System (IMS) designed to digitize and streamline stock operations across warehouses, production floors, and logistics hubs. It replaces manual registers and scattered spreadsheets with an immutable, automated, and predictive supply chain engine.

---

## Key Highlights & Innovations

### 1. Barcode & QR Code Scanning Engine
- **Live Web Camera Scanner**: Scans physical product labels via `html5-qrcode`.
- **Virtual Hardware Simulator**: Desktop test terminal to simulate laser barcode input.
- **Smart Mispick Prevention**: Scanning an incorrect item barcode during outbound picking triggers a visual chime warning and blocks the mispick before shipment.
- **Printable Barcode & QR Labels**: Generates printable 1D barcodes & 2D QR code labels for products.

### 2. Predictive Low-Stock Engine (Velocity-Based)
- **Rolling 30-Day Velocity**: Computes average daily consumption (`avg_daily_consumption`) per SKU.
- **Derived Stockout Date**: Calculates exact depletion forecast (`current_stock / avg_daily_consumption`).
- **Proactive Lead-Time Alerts**: Flags items at risk if predicted stockout occurs before supplier fulfillment lead time.
- **1-Click Auto-Draft Receipt**: Automatically generates a pre-filled vendor receipt draft with suggested reorder quantities (`max_qty - current_stock`).

### 3. Tamper-Evident SHA-256 Stock Ledger
- **Cryptographic Chaining**: Every inventory movement creates a `StockLedgerEntry` chained via `entry_hash = SHA-256(prev_hash + transaction payload)`.
- **Ledger Verification**: Interactively inspects block hash headers to verify chain integrity.
- **Tamper Simulation Test Tool**: Includes a built-in simulation to test how unauthorized database manipulation breaks the cryptographic hash chain.

### 4. Governance & Role Switcher
- **Dual Manager Approval**: High-value adjustments (>\$200 or 10+ units) require explicit authorization by an Inventory Manager before updating live stock.
- **Persona Switcher**: Switch between **Inventory Manager** and **Warehouse Staff** roles to test permission boundaries.
- **OTP Password Reset**: Dynamic One-Time Password verification flow.

---

## Core Operations

| Module | Purpose | Impact |
| :--- | :--- | :--- |
| **Products & Catalog** | Master catalog, SKU indexing, Min/Max reorder rules, unit costs | Multi-location stock breakdown |
| **Receipts (Incoming)** | Receive vendor shipments | Increments location stock & writes SHA-256 block |
| **Delivery Orders (Outgoing)** | Customer order picking & shipping | Decrements stock with barcode mispick guard |
| **Internal Transfers** | Move stock between internal storage racks or stores | Relocates stock while global total stays constant |
| **Stock Adjustments** | Fix physical count vs recorded stock mismatches | Auto-computes delta with dual approval rules |
| **Stock Ledger** | Immutable cryptographic audit log | Complete audit trail & hash chain verifier |

---

## Technology Stack

- **Frontend Framework**: React 18 + TypeScript + Vite
- **Styling**: Vanilla CSS (Industrial Dark Theme, Slate/Navy palette, no purple gradients, crisp 6px buttons)
- **Icons**: Lucide React SVG Icon Suite
- **Cryptography**: Web Crypto API (SHA-256 Digesting)
- **Barcode & QR Rendering**: `html5-qrcode` & `qrcode` canvas renderer

---

## Getting Started

### Prerequisites
- Node.js `v18+` or `v24+`
- npm `v9+` or `v11+`

### Installation & Local Setup

```bash
# 1. Clone repository
git clone https://github.com/vishwar-SJ/StockSense.git
cd StockSense

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open `http://localhost:3000/` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## License

Distributed under the MIT License.
