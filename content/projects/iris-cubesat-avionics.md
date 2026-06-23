# IRIS 3U CubeSat Avionics Systems

* **Project Type:** Space System Hardware Development
* **Organization:** STAR Laboratory (University of Manitoba)
* **Program:** Canadian Space Agency (CSA) Canadian CubeSat Project
* **Role:** Lead Avionics Developer

---

## 1. Technical Objectives & Constraints
* **Platform:** Design the electrical power system, telemetry, and payload control architecture for the IRIS 3U research nanosatellite.
* **Space Environment:** Mitigate Single Event Upsets (SEUs) caused by orbital radiation while staying within strict weight, volume, and power budgets.
* **Governance:** Escrow and present all electrical hardware designs through formal Canadian Space Agency (CSA) reviews.

---

## 2. Distributed Power & Bus Architecture

```
                       +----------------------------------+
                       |           EPS Board              |
  [Solar Panels] ----->|  - MSP430 Regulator (DET / SSR)  |
                       |  - LiFePO4 Battery Protection    |
                       +----------------------------------+
                                        |
                 +----------------------+----------------------+
                 | (Raw Battery Voltage Power Bus)             |
                 v                                             v
  +------------------------------+             +------------------------------+
  |          OBC Board           |             |      Payload Imager Board    |
  | - SmartFusion2 SoC           |             | - STM32F4 MCU                |
  | - Local Buck Regulator       |             | - Local LDO & Filter Caps    |
  +------------------------------+             +------------------------------+
                 ^                                             ^
                 +==================[ CAN Bus ]================+
```

### Direct Energy Transfer (DET) Power Bus
* **Concept:** Instead of placing a central high-frequency switching regulator on the EPS board (which would introduce switching noise and act as a single point of failure), the system utilized a Direct Energy Transfer (DET) architecture.
* **Battery Bus:** The EPS distributed raw battery voltage directly to all satellite subsystems. This was feasible because the LiFePO4 (Lithium Iron Phosphate) chemistry provides a highly stable voltage discharge curve (typically 12.8V–13.6V for a 4S configuration).
* **Power Control:** The EPS board incorporated low-power, high-reliability switches managed by a TI MSP430 microcontroller. The MSP430 controlled power distribution to each subsystem and governed solar charging using Sequential Switch Regulation (SSR).

### Local Subsystem Power Regulation
* **Decentralized Regulators:** Each subsystem regulated its own power locally (e.g., the payload imager utilized local regulators and extensive bulk decoupling capacitance). This kept switching noise contained near the load.
* **Cabling & Communication:** Subsystems were linked via a robust, differential CAN bus network utilizing shielded twisted-pair cabling. This eliminated the need for fragile multi-board stack connectors and provided high noise immunity.

---

## 3. Selected Controller Architecture
* **Main OBC (Command & Data Handling):** Selected the **Microsemi SmartFusion2 SoC** (incorporating a hard ARM Cortex-M3 processor and flash-based FPGA fabric) to provide excellent radiation tolerance against single-event upsets.
* **Payload Imager:** Selected the **STM32F4 microcontroller**, leveraging its hardware Digital Camera Interface (DCMI) to interface directly with scientific imaging sensors.
* **EPS Controls:** Selected the ultra-low-power **TI MSP430 microcontroller** to manage the power switches and monitor solar charging currents.

---

## 4. Hardware Verification & Launch Approvals
* **Bring-up:** Completed multi-layer PCB layout designs in Altium Designer, incorporating thermal copper paths to dissipate heat in the vacuum of space. Conducted bring-up testing of all boards, validating power rail isolation and CAN bus differential signals.
* **Flight Clearance:** Escorted the electrical systems design through formal Preliminary Design Reviews (PDR) and Critical Design Reviews (CDR) hosted by panels of engineers from the **Canadian Space Agency (CSA)** and **Nanoracks**, securing full spaceflight integration approvals.

---

## 5. Engineering Retrospective & Hindsight
* **Ideal Diodes vs. Hot-Swap Inrush Control:**
  In the initial EPS design, we opted for ideal diodes to handle power path selection and reverse current protection. While this minimized forward voltage drops and heat dissipation, ideal diodes do not provide active current limit control during hot-plugging events. In hindsight, implementing a dedicated hot-swap controller with active inrush current control (slew-rate control on the MOSFET gate) would have been a superior design choice. It would have provided robust short-circuit protection and prevented transient voltage dips on the shared DET power bus during card insertion or subsystem power-up.
