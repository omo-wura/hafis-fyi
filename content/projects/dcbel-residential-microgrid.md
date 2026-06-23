# Residential Microgrid & ESS Converters (dcbel)

* **Company:** dcbel inc.
* **Role:** Power Electronics Design Engineer
* **Scope:** 14kW ESS Bi-directional DC/DC Converter & 400W–600W Solar DC Optimizer
* **Compliance Standards:** UL 1741, UL 60730 Class B, FCC Part 15

---

## 1. Technical Objectives & Constraints
* **ESS Interface:** Develop a bi-directional, non-isolated power stage capable of transferring 14kW nominal (with a 10-second peak power boost up to 20kW) between the high-voltage battery pack and the internal DC bus.
* **Solar Integration:** Engineer a module-level DC optimizer (400W–600W class) to maximize solar energy harvesting and comply with safety rapid shutdown standards.
* **Safety & Protections:** Integrate active precharge paths, ground fault detection, and fast-acting fuses to handle high short-circuit currents.

---

## 2. Electrical & Mechanical Architecture

```
                 +-----------------------------------+
                 |        14kW ESS DC/DC Stage       |
  [ESS Pack] --->| [Fuses] -> [Relays] -> [Precharge]|---> [Internal DC Bus]
                 |         [Half-Bridge Converter]   |
                 +-----------------------------------+
                                   ^
                                   | (CAN Bus)
                                   v
                 +-----------------------------------+
                 |        Solar DC Optimizer         |
  [PV Modules] ->| [MPPT Control] -> [PLC Telemetry] |---> [Combiner Box]
                 |       [Rapid Shutdown Switch]     |
                 +-----------------------------------+
```

### 14kW ESS Bidirectional Converter
* **Topology:** Non-isolated bidirectional half-bridge power stage operating with high power density.
* **Inrush Control:** Designed a passive precharge network featuring a high-power current-limiting resistor and a bypass contactor to protect main relay contacts from welding during the bus charge sequence.
* **Contact Control:** Implemented economized coil controllers for the main contactors to minimize steady-state thermal dissipation and energy consumption during continuous operation.
* **Transient Capability:** Sized and validated the power stage to support Locked Rotor Amperage (LRA) loads and 20kW transient power spikes.

### Module-Level Solar DC Optimizer
* **Features:** Implemented Maximum Power Point Tracking (MPPT) for cascaded series-connected modules.
* **Telemetry:** Programmed Power Line Communication (PLC) nodes to transmit real-time telemetry over the power lines to the central combiner box.
* **Safety:** Integrated a rapid shutdown circuit that drops module-level voltages to safe levels within seconds of utility loss. Co-authored **US Patent 12,658,699** defining the overvoltage protection control and rapid shutdown apparatus.

---

## 3. Key Engineering Challenges & Solutions

### A. High-Density Thermal Management
* **Challenge:** Dissipating heat from the 14kW converter switches in a compact enclosure without resorting to noisy, low-reliability fans.
* **Solution:** Utilized top-side cooled discrete power devices, mounting them directly to an internal copper heatspreader. The heatspreader was thermally coupled to a giant aluminum chassis bedrock using high-performance Thermal Interface Materials (TIMs). This decoupled the thermal pathway from the PCB, keeping junction temperatures well within safety margins.

### B. EV Charger Cable Check Forensics
* **Challenge:** Occasional, false desaturation (DESAT) faults were triggered on the main switching inline IGBTs during the EV charger's cable check sequence, halting the startup sequence.
* **Solution:** Conducted first-principles forensic analysis on the IGBT gates. Traced the issue to the physical sensitivity of the IGBTs under very low-current bleeder loads (where the vehicle contactors were still open). Solved the issue by synthesizing a custom hardware noise filter and adjusting the gate driver blanking time, restoring system stability.
