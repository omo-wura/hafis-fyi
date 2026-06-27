# IGBT Desaturation Forensics: Debugging False Trips under Light Load Currents

* **Date:** June 15, 2026
* **Series:** Forensics Case Studies
* **Series Part:** 1
* **Category:** Engineering Forensics
* **Tags:** Power Electronics, IGBT, DESAT, Troubleshooting
* **Excerpt:** Troubleshooting sporadic desaturation (DESAT) faults on main switching IGBTs during high-voltage startup validation under ultra-light load currents using first-principles gate-charge diagnostics.

---

## The Symptom

During the validation of a high-power bidirectional power converter, the system controller reported sporadic desaturation (DESAT) faults on the main switching IGBTs. Interestingly, these faults did not occur during peak power transfer or severe load steps. Instead, they tripped exclusively during the initial **low-power startup sequence**, when the output contactors were open and the system was operating under an extremely light auxiliary/bleeder current (typically 50–100mA).

Whenever a fault was flagged, the gate driver automatically shut down the power stage within 2 microseconds to protect the silicon. This brought the entire startup sequence to a grinding halt.

---

## First-Principles of DESAT Detection

Before diving into the forensics, it is worth reviewing the operating principle of a classic desaturation protection circuit:

```
            +V_cc (e.g. +15V)
               |
              [R_pullup]
               |
               +-------+------> To DESAT Comparator Input
               |       |
             [C_blank] |
               |     [D_desat]
              GND      |
                       v  (IGBT Collector)
                     |\
                     | \___ 
                     | /   |
                     |/____|
                       |
                       v  (IGBT Emitter)
```

1. **On-State:** When the IGBT is turned ON, its collector-emitter voltage ($V_{ce}$) should drop to its saturation voltage, typically $V_{ce(sat)} \approx 1.5\text{V} - 2.5\text{V}$.
2. **Short-Circuit:** If a short-circuit occurs, the current shoots up, pulling the device out of saturation. $V_{ce}$ rises rapidly toward the DC bus voltage.
3. **Detection:** The diode $D_{desat}$ blocks the high voltage, allowing the internal pull-up resistor $R_{pullup}$ (or current source) to charge the blanking capacitor $C_{blank}$. If the voltage across $C_{blank}$ exceeds a set threshold (typically $6.5\text{V} - 9\text{V}$), the comparator trips the shutdown.
4. **Blanking Time:** Because $V_{ce}$ takes time to fall during turn-on, the blanking capacitor $C_{blank}$ prevents the comparator from tripping during the transition. The blanking time is defined by:
   $$ t_{blank} = \frac{C_{blank} \cdot V_{th}}{I_{charge}} $$

---

## The Investigation

We captured high-resolution waveforms of the Gate-Emitter voltage ($V_{ge}$), Collector-Emitter voltage ($V_{ce}$), and the DESAT pin voltage during the failure event:

```
V_ge  ____/~~~~~~~~~~~~~~~~~~~~~~~  (Gate Turn-on)
V_ce  ~~~~~~~\____________________  (Collector voltage drops)
DESAT _________/~\________________  (False trip threshold spike!)
               ^
          Switching transition
```

### The Anomaly

At turn-on, $V_{ce}$ began dropping as expected. However, because the load current was so low, the IGBT's internal charge carrier density did not establish itself quickly enough. The collector-emitter output capacitance ($C_{oes}$) discharged slowly under light loading. This resulted in a prolonged fall-time for $V_{ce}$ to reach its fully saturated state.

The prolonged $V_{ce}$ fall-time exceeded the configured blanking time ($t_{blank}$). Consequently, the DESAT diode remained reverse-biased longer than expected, allowing the pull-up current source to charge $C_{blank}$ all the way up to the comparator threshold, triggering a false desaturation trip.

### The Secondary Culprit: Gate Noise Coupling

To make matters worse, zoom-in captures of the switching transition revealed high-frequency voltage spikes ($dv/dt$ transients) coupling from the collector back to the gate driver circuit through the IGBT's reverse transfer capacitance ($C_{res}$ or Miller capacitance). This noise coupled directly onto the high-impedance DESAT detection trace, causing the capacitor $C_{blank}$ to charge prematurely.

---

## The Solution

To resolve the false trips without modifying the power silicon or altering the layout of the high-voltage PCB, we synthesized a dual-action hardware and firmware mitigation:

1. **Hardware Filter Tuning:** 
   * We increased the blanking capacitor $C_{blank}$ to extend the blanking time (typically doubling it). This gave the collector voltage enough time to fully settle under ultra-light current states.
   * We added a small series resistor in line with $D_{desat}$ and a local high-frequency ceramic decoupling capacitor directly across the DESAT comparator pin to suppress high $dv/dt$ transient noise coupling.
2. **Firmware Sequence Adaptation:**
   * We modified the startup firmware to establish a minimum auxiliary load before pulsing the power stage. This increased the starting current loop during the initial turn-on pulses, speeding up the carrier charge sweep inside the IGBT drift region.

---

## The Verdict

After applying these updates, we re-ran the startup sequence across the full operational temperature range. The false DESAT trips were completely eliminated. The system consistently cleared the startup checks, maintaining full protection capability against genuine overcurrent and short-circuit faults (verified by intentionally triggering a short-circuit fault in a safe lab environment).

This case study is a testament to the importance of evaluating power electronics controls not just at full load, but also at the operating boundaries where component non-linearities and parasite physics behave in unexpected ways.
