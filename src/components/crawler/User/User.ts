import { generateUniqueString } from '../utils';

export class User {
  private static storageName = 'crawler-user';

  static getId(): string {
    return this.getUser() ?? this.setUser();
  }

  private static getUser(): string | null {
    return localStorage.getItem(this.storageName);
  }

  private static setUser(): string {
    const userId = generateUniqueString();
    localStorage.setItem(this.storageName, userId);
    return userId;
  }
}
