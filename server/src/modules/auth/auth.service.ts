import { query } from '../../config/db';
import { User, UserPublic, UserRole } from '../../types/index';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateTokenPair } from '../../utils/jwt';

interface LoginResult {
    user: UserPublic;
    accessToken: string;
    refreshToken: string;
}

export const login = async (email: string, password: string): Promise<LoginResult | null> => {
    const result = await query(
        `SELECT id, tenant_id, email, password_hash, name, role, created_at
     FROM users 
     WHERE email = $1 AND is_deleted = false`,
        [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const user = result.rows[0] as User;
    const validPassword = await comparePassword(password, user.password_hash);

    if (!validPassword) {
        return null;
    }

    const tokens = generateTokenPair({
        userId: user.id,
        tenantId: user.tenant_id,
        role: user.role as UserRole,
        email: user.email,
    });

    const userPublic: UserPublic = {
        id: user.id,
        tenant_id: user.tenant_id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
        created_at: user.created_at,
    };

    return {
        user: userPublic,
        ...tokens,
    };
};

export const getUserById = async (userId: string): Promise<UserPublic | null> => {
    const result = await query(
        `SELECT id, tenant_id, email, name, role, created_at
     FROM users 
     WHERE id = $1 AND is_deleted = false`,
        [userId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0] as UserPublic;
};

export const refreshTokens = async (userId: string, tenantId: string) => {
    const user = await getUserById(userId);
    if (!user) return null;

    return generateTokenPair({
        userId: user.id,
        tenantId,
        role: user.role,
        email: user.email,
    });
};
