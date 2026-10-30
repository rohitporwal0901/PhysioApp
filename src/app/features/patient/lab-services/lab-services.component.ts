import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Observable, map } from 'rxjs';
import { MockApiService } from '../../../core/services/mock-api.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-lab-services',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './lab-services.component.html',
    styleUrl: './lab-services.component.scss'
})
export class LabServicesComponent implements OnInit {
    private api = inject(MockApiService);
    private sanitizer = inject(DomSanitizer);
    labs$: Observable<any[]> | undefined;
    
    isPdfModalOpen = false;
    selectedPdfUrl: SafeResourceUrl | null = null;

    ngOnInit() {
        this.labs$ = this.api.getLabTechnicians().pipe(
            map(techs => techs.filter(t => t.active))
        );
    }

    callLab(phone: string) {
        if (phone) window.open(`tel:${phone}`, '_self');
        else alert('Phone number not available');
    }

    chatOnWhatsapp(whatsapp: string) {
        if (whatsapp) {
            const formatted = whatsapp.replace(/\D/g, '');
            window.open(`https://wa.me/${formatted}`, '_blank');
        } else {
            alert('WhatsApp number not available');
        }
    }

    openPdfModal(url: string | undefined) {
        if (!url) {
            // fallback dummy pdf
            this.selectedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        } else {
            this.selectedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
        this.isPdfModalOpen = true;
    }

    closePdfModal() {
        this.isPdfModalOpen = false;
        this.selectedPdfUrl = null;
    }
}
