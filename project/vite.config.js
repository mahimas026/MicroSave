import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    rollupOptions: {
      input: {
        login: 'login.html',
        index: 'index.html',
        groups: 'groups.html',
        members: 'members.html',
        contributions: 'contributions.html',
        loans: 'loans.html',
        repayments: 'repayments.html',
      },
    },
  },
});
