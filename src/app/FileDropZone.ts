export type FileDropZoneCallbacks = {
  onZip(file: File): void;
  onFolder(files: FileList): void;
};

export class FileDropZone {
  private readonly zipInput: HTMLInputElement;
  private readonly folderInput: HTMLInputElement;

  constructor(
    private readonly element: HTMLElement,
    private readonly callbacks: FileDropZoneCallbacks,
  ) {
    this.zipInput = this.element.querySelector<HTMLInputElement>("#zip-input")!;
    this.folderInput = this.element.querySelector<HTMLInputElement>("#folder-input")!;
  }

  mount(): void {
    this.element.addEventListener("dragover", this.onDragOver);
    this.element.addEventListener("dragleave", this.onDragLeave);
    this.element.addEventListener("drop", this.onDrop);
    this.element.querySelector<HTMLButtonElement>("[data-open-zip]")?.addEventListener("click", () => {
      this.zipInput.click();
    });
    this.element.querySelector<HTMLButtonElement>("[data-open-folder]")?.addEventListener("click", () => {
      this.folderInput.click();
    });
    this.zipInput.addEventListener("change", () => {
      const file = this.zipInput.files?.[0];
      if (file) {
        this.callbacks.onZip(file);
      }
      this.zipInput.value = "";
    });
    this.folderInput.addEventListener("change", () => {
      const files = this.folderInput.files;
      if (files && files.length > 0) {
        this.callbacks.onFolder(files);
      }
      this.folderInput.value = "";
    });
  }

  private readonly onDragOver = (event: DragEvent): void => {
    event.preventDefault();
    this.element.classList.add("is-dragging");
  };

  private readonly onDragLeave = (): void => {
    this.element.classList.remove("is-dragging");
  };

  private readonly onDrop = (event: DragEvent): void => {
    event.preventDefault();
    this.element.classList.remove("is-dragging");
    const file = event.dataTransfer?.files?.[0];
    if (file && file.name.toLowerCase().endsWith(".zip")) {
      this.callbacks.onZip(file);
    }
  };
}
