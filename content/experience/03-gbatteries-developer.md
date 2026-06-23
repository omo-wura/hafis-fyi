# Digital Power Electronics Developer

* **Company:** GBatteries Energy inc. (Ottawa, Ontario, Canada)
* **Title:** Digital Power Electronics Developer
* **Period:** April 2021 - November 2022

## Role Overview
Designed, simulated, and built high-frequency switched-mode battery cycling instruments to characterize advanced fast-charging profiles for Lithium-ion chemistries. Co-designed real-time digital control loop firmware and modeled feedback loop stability.

## Core Accomplishments
* **High-Frequency GaN Converter Design:** Designed high-frequency GaN bidirectional power converters (500kHz per phase) for specialized battery cycling instruments. Completed high-speed, multi-layer PCB layouts in Altium Designer, managing parasitics and isolation under fast dv/dt switching environments.
* **Firmware & Control Loop Coding:** Programmed real-time C/ASM firmware on microcontrollers, implementing deterministic assembly-level safety overrides and control clamps to prevent transient battery overshoots during high-rate transients.
* **Loop Stability Modeling:** Modeled converter small-signal transfer functions and characterized loop margins (Gain/Phase) in LTspice to stabilize high-speed GaN converter loops.

## Engineering Retrospective & Hindsight
* **Integrated GaN IC vs. Beefed-Up Discrete Stage:**
  In designing the multistage battery cycling power instruments, we utilized an integrated GaN IC for one of the stages to minimize PCB footprint and simplify design. However, operating at high frequency (500kHz) with the integrated driver introduced complex thermal constraints and layout sensitivities. In retrospect, this stage would have been better served by a single beefed-up discrete silicon or GaN power stage switching at a lower frequency. This would have improved thermal dissipation, simplified the PCB layout, and lowered overall BOM cost without compromising the cycler's transient performance.

