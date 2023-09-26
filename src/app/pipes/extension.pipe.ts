import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'extension'
})
export class FileExtensionPipe implements PipeTransform {
  transform(value: any) {
    if (value) {
      let icon: string;
      switch (value.slice(-3)) {
        case 'pdf': {
          icon = 'file-pdf-o';
          break;
        }
        case 'jpg': {
          icon = 'file-image-o';
          break;
        }
        case 'zip': {
          icon = 'file-archive-o';
          break;
        }
        default: {
          icon = 'file-o';
          break;
        }
      }
      return icon;
    }
    return value;
  }
}
