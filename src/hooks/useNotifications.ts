import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { getTodosFromDay } from '@/api/apiTodos';

export const useNotifications = () => {
  const { currentUser } = useAuth();

  const checkTodosAndNotify = useCallback(async () => {
    if (!currentUser) return;

    try {
      const today = format(new Date(), 'dd-MM-yyyy');
      const todosFromDay = await getTodosFromDay(today, currentUser);
      
      if (!todosFromDay?.length) return;

      const uncompletedTodos = todosFromDay.filter(todo => !todo.isCompleted);
     

      if (uncompletedTodos.length > 0) {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification('Unfulfilled tasks!', {
            body: `You have ${uncompletedTodos.length} of uncompleted tasks for today!`,
            icon: '/vite.svg',
            requireInteraction: true,
            tag: 'todo-notification'
          });
        }
      }
    } catch (error) {
      console.error('Error during task checking:', error);
    }
  }, [currentUser]);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted' && currentUser) {
          // Production version - check at 20:00
          /* 
          const targetHour = 20;
          const targetMinute = 0;

          const now = new Date();
          const targetTime = new Date();
          targetTime.setHours(targetHour, targetMinute, 0, 0);

          if (now > targetTime) {
            targetTime.setDate(targetTime.getDate() + 1);
          }

          const delay = targetTime.getTime() - now.getTime();
          console.log('Next check about:', new Date(now.getTime() + delay).toLocaleString());

          const timerId = setTimeout(checkTodosAndNotify, delay);
          return () => clearTimeout(timerId);
          */

          // Test version - check every 3 minutes
          console.log('Checking every 3 minutes started');
          const interval = setInterval(checkTodosAndNotify, 3 * 60 * 1000);
          
          // Sprawdź od razu przy starcie
          await checkTodosAndNotify();
          
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error('Error when setting up notifications:', error);
      }
    };

    if (currentUser) {
      setupNotifications();
    }
  }, [currentUser, checkTodosAndNotify]);
}; 