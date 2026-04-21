import { Component, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../../core/services/gemini.service';
import { LucideAngularModule, MessageCircle, X, Send, Bot, User } from 'lucide-angular';

interface ChatMessage {
  text: string;
  isUser: boolean;
  time: Date;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent implements AfterViewChecked {
  readonly MessageCircle = MessageCircle;
  readonly X = X;
  readonly Send = Send;
  readonly Bot = Bot;
  readonly User = User;

  private geminiService = inject(GeminiService);

  isOpen = false;
  messages: ChatMessage[] = [
    { text: "Hi! I'm your AI health assistant. I can help answer questions about Health Hub services and basic healthcare. How can I help you?", isUser: false, time: new Date() }
  ];
  userInput = '';
  isTyping = false;

  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  async sendMessage() {
    if (!this.userInput.trim()) return;

    const userText = this.userInput;
    this.messages.push({ text: userText, isUser: true, time: new Date() });
    this.userInput = '';
    this.isTyping = true;

    try {
      const response = await this.geminiService.sendMessage(userText);
      this.messages.push({ text: response, isUser: false, time: new Date() });
    } catch (err) {
      console.error('Chat error:', err);
      this.messages.push({ text: "Sorry, I encountered an error. Please try again later.", isUser: false, time: new Date() });
    } finally {
      this.isTyping = false;
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }
}
