import { BoardMembership } from '@/domain/models/membership';
import { useAuth } from '@/presentation/contexts/auth-context';
import { dependencies } from '@/shared/di/dependencies';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useBoardMembersViewModel(boardId: number) {
  const { token, userId } = useAuth();
  const [members, setMembers] = useState<BoardMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const loadMembers = useCallback(() => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    return dependencies.getMembersUseCase
      .execute(token, boardId)
      .then((payload) => {
        setMembers(payload);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los miembros.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token, boardId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const currentMembership = useMemo(
    () => members.find((member) => member.user.id === userId) ?? null,
    [members, userId]
  );
  const isOwner = currentMembership?.role === 'owner';

  const inviteMember = async (): Promise<void> => {
    setInviteError(null);

    if (!inviteEmail.trim()) {
      setInviteError('El correo electrónico es obligatorio');
      throw new Error('El correo electrónico es obligatorio');
    }

    if (!token) {
      throw new Error('No hay una sesión activa.');
    }

    setIsInviting(true);
    try {
      await dependencies.addMemberUseCase.execute(token, boardId, { email: inviteEmail.trim() });
      setInviteEmail('');
      await loadMembers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo agregar al miembro.';
      setInviteError(message);
      throw err;
    } finally {
      setIsInviting(false);
    }
  };

  const removeMember = async (membershipId: number): Promise<void> => {
    if (!token) {
      throw new Error('No hay una sesión activa.');
    }

    setRemovingId(membershipId);
    setRemoveError(null);
    try {
      await dependencies.removeMemberUseCase.execute(token, boardId, membershipId);
      await loadMembers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo quitar al miembro.';
      setRemoveError(message);
      throw err;
    } finally {
      setRemovingId(null);
    }
  };

  return {
    members,
    isLoading,
    error,
    isOwner,
    inviteEmail,
    setInviteEmail,
    isInviting,
    inviteError,
    inviteMember,
    removingId,
    removeError,
    removeMember,
    reload: loadMembers,
  };
}
