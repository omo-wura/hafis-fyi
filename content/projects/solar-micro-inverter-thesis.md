# 400W Solar Micro-Inverter with Integrated Magnetics

* **Project Type:** Master of Science Thesis Research
* **Academic Lab:** Renewable Energy Interface and Grid Automation Laboratory (University of Manitoba)
* **Target Rating:** 400 W
* **Target Controller:** Texas Instruments C2000 Delfino MCU (TMS320F28379D)

---

## 1. Technical Concept & Objectives
To lower the cost and component count of grid-tied solar systems, this project designed and built a single-stage, isolated solar micro-inverter. Instead of traditional cascaded stages (DC/DC boost followed by a DC/AC inverter), this design utilized a novel flyback-family topology that integrates the isolation transformer and buck-boost inductors onto a single magnetic core (integrated magnetics).

---

## 2. System Architecture & Controls

```
  [PV Input] ---> [Integrated Magnetic Stage] ---> [Unfolding Bridge] ---> [Utility Grid]
       |                      ^                           ^
   (Vpv, Ipv)                 | (100kHz PWM)              | (Line Freq)
       |                      |                           |
       v                      +---------------------------+
  [F28379D MCU] ---> [Dual-Loop: Grid Current Inner & MPPT Outer Loops]
```

### Integrated Magnetic Core
* **Core Selection:** Built the magnetic assembly on a standard manganese-zinc ferrite E-core geometry.
* **Winding Integration:** Combined the high-frequency isolation transformer and the buck-boost inductor windings on the same core structure to minimize core count and footprint.

### Real-Time Control Loops
* **Inner Loop:** Implemented average current mode control to regulate grid current injection, shaping it to be sinusoidal and in-phase with the grid voltage.
* **Outer Loop:** Designed a Maximum Power Point Tracking (MPPT) loop utilizing grid parameters ($V_g$, $I_g$) to estimate power throughput and adjust the reference relative to the PV panel voltage ($V_{pv}$).
* **Execution:** Programmed the real-time control system in bare-metal C on a TI Delfino F28379D MCU, synchronizing ADC conversions with the 100kHz PWM switching frequency.

---

## 3. Engineering Challenges & Critical Retrospective

### Prototype Characterization
* **Performance outcome:** The completed prototype achieved grid-tied injection but suffered from a low peak efficiency of approximately 65%.
* **Root-Cause Analysis:**
  * **Hand-Wound Core Leakage:** Fabricating the integrated magnetic structure by hand without advanced industrial winding equipment led to poor coupling coefficients and high leakage inductance.
  * **Parasitic Ringing:** The high leakage inductance stored energy that was dissipated in snubber networks and clamp circuits rather than being transferred, causing high thermal losses at 100kHz.
  * **Layout Parasitics:** High-frequency loop layouts had suboptimal return paths, compounding parasitic inductances and device switching losses.

### Professional Growth
This thesis prototype served as a masterclass in high-frequency power electronics layout. The lessons learned in diagnosing this prototype's leakage losses directly informed the layout practices used in subsequent commercial designs:
* **GaN Board Layouts:** Enabled the design of 500kHz GaN switching loops with sub-nanohenry loop inductances at GBatteries.
* **Insulation Coordination:** Guided the clearances and creepages implemented in high-voltage 14kW stages at dcbel.
