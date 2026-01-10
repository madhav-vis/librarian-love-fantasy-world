// Simple console progress bar utility
export class ProgressBar {
  private total: number;
  private current: number;
  private barLength: number;
  private label: string;

  constructor(total: number, label: string = "Progress", barLength: number = 30) {
    this.total = total;
    this.current = 0;
    this.barLength = barLength;
    this.label = label;
  }

  update(current: number, customLabel?: string) {
    this.current = Math.min(current, this.total);
    const percentage = (this.current / this.total) * 100;
    const filledLength = Math.round((this.barLength * this.current) / this.total);
    const bar = "█".repeat(filledLength) + "░".repeat(this.barLength - filledLength);
    const label = customLabel || this.label;
    process.stdout.write(`\r${label}: [${bar}] ${percentage.toFixed(1)}% (${this.current}/${this.total})`);
    
    if (this.current >= this.total) {
      process.stdout.write("\n");
    }
  }

  increment(amount: number = 1, customLabel?: string) {
    this.update(this.current + amount, customLabel);
  }

  complete(customLabel?: string) {
    this.update(this.total, customLabel);
  }

  finish() {
    if (this.current < this.total) {
      process.stdout.write("\n");
    }
  }
}

// Helper function for simple progress logging
export function logProgress(message: string, step?: number, total?: number) {
  const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
  if (step !== undefined && total !== undefined) {
    const percentage = ((step / total) * 100).toFixed(1);
    console.log(`[${timestamp}] ✓ ${message} (${step}/${total} - ${percentage}%)`);
  } else {
    console.log(`[${timestamp}] → ${message}`);
  }
}

// Helper for step-by-step operations
export function logStep(step: number, total: number, message: string) {
  logProgress(message, step, total);
}

// Helper for completion
export function logComplete(message: string) {
  const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
  console.log(`[${timestamp}] ✓ ${message}`);
}

// Helper for errors
export function logError(message: string, error?: any) {
  const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
  console.error(`[${timestamp}] ✗ ${message}`);
  if (error) {
    console.error(`[${timestamp}]   Error:`, error.message || error);
  }
}
