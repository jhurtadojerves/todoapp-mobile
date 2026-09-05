import { Alert, Platform } from 'react-native';
import { confirmAction } from '@/shared/utils/confirm';

describe('confirmAction', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    (Platform as { OS: string }).OS = originalOS;
    jest.restoreAllMocks();
  });

  describe('on web', () => {
    beforeEach(() => {
      (Platform as { OS: string }).OS = 'web';
    });

    it('should resolve true when window.confirm returns true', async () => {
      const confirmMock = jest.fn().mockReturnValue(true);
      (window as unknown as { confirm: typeof confirmMock }).confirm = confirmMock;

      const result = await confirmAction({ title: 'Eliminar', message: '¿Seguro?' });

      expect(result).toBe(true);
      expect(confirmMock).toHaveBeenCalledWith('Eliminar\n\n¿Seguro?');
    });

    it('should resolve false when window.confirm returns false', async () => {
      (window as unknown as { confirm: () => boolean }).confirm = jest.fn().mockReturnValue(false);

      const result = await confirmAction({ title: 'Eliminar', message: '¿Seguro?' });

      expect(result).toBe(false);
    });
  });

  describe('on native', () => {
    beforeEach(() => {
      (Platform as { OS: string }).OS = 'ios';
    });

    it('should resolve true when the destructive button is pressed', async () => {
      jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
        buttons?.[1]?.onPress?.();
      });

      const result = await confirmAction({ title: 'Eliminar', message: '¿Seguro?' });

      expect(result).toBe(true);
    });

    it('should resolve false when the cancel button is pressed', async () => {
      jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
        buttons?.[0]?.onPress?.();
      });

      const result = await confirmAction({ title: 'Eliminar', message: '¿Seguro?' });

      expect(result).toBe(false);
    });
  });
});
