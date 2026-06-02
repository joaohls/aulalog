import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, Calendar, User, LogOut, Plus, Search, Edit2, Trash2, 
  ArrowLeft, Eye, Sun, Moon 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from './utils/cn';
import type { Aula, User as UserType, Stats } from './types/index';
import { signIn, signUp, signOut as supabaseSignOut } from './lib/supabase';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

// Mock user for demo
const DEMO_USER: UserType = {
  id: 'demo-user-id',
  nome: 'João Silva',
  email: 'joao.silva@estudante.edu'
};

const STORAGE_KEY = 'aulalog_aulas';
const USER_STORAGE_KEY = 'aulalog_user';

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-2xl px-6 py-4 shadow-2xl",
      type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
    )}>
      <div className="flex items-center gap-2">
        {type === 'success' ? (
          <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">✓</div>
        ) : (
          <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">✕</div>
        )}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // Ensure register page starts in dark theme
  useEffect(() => {
    const root = document.documentElement;
    const hadLight = root.classList.contains('theme-light');
    if (hadLight) root.classList.remove('theme-light');
    return () => {
      if (hadLight) root.classList.add('theme-light');
    };
  }, []);

  // Ensure login page starts in dark theme (temporarily remove light class)
  useEffect(() => {
    const root = document.documentElement;
    const hadLight = root.classList.contains('theme-light');
    if (hadLight) root.classList.remove('theme-light');
    return () => {
      if (hadLight) root.classList.add('theme-light');
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres.');
      setIsLoading(false);
      return;
    }

    const res = await signIn({ email, password });
    if (res.error) {
      setError(res.error);
      setIsLoading(false);
      return;
    }

    if (res.user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      setShowToast({ message: 'Login realizado com sucesso!', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 800);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-violet-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tighter">AulaLog</h1>
              <p className="text-xs text-violet-400 -mt-1">REGISTRO DE AULAS</p>
            </div>
          </div>
          <p className="text-zinc-400 text-center max-w-xs">Registre suas aulas assistidas e acompanhe seu progresso acadêmico</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-6">Entrar na conta</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm text-zinc-400 block mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-2xl px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div>
              <label className="text-sm text-zinc-400 block mb-1.5">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-2xl px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-white text-zinc-900 hover:bg-zinc-100 transition-colors font-semibold rounded-2xl flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <button 
              onClick={() => navigate('/register')}
              className="text-violet-400 hover:text-violet-300 text-sm font-medium"
            >
              Não tem uma conta? Cadastre-se
            </button>
            <div>
              <button 
                onClick={() => navigate('/forgot-password')}
                className="text-zinc-400 hover:text-zinc-300 text-sm"
              >
                Esqueci minha senha
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800 text-[10px] text-center text-zinc-500">
            Modo DEMO • Use qualquer e-mail e senha com 6+ caracteres
          </div>
        </div>
        
        <p className="text-center text-zinc-500 text-xs mt-8">AulaLog © Demo 2026</p>
      </div>

      {showToast && (
        <Toast 
          message={showToast.message} 
          type={showToast.type} 
          onClose={() => setShowToast(null)} 
        />
      )}
    </div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // Ensure forgot-password page starts in dark theme
  useEffect(() => {
    const root = document.documentElement;
    const hadLight = root.classList.contains('theme-light');
    if (hadLight) root.classList.remove('theme-light');
    return () => {
      if (hadLight) root.classList.add('theme-light');
    };
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!nome || !email || !password || !confirmPassword) {
      setError('Todos os campos são obrigatórios.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setIsLoading(false);
      return;
    }

    const res = await signUp({ nome, email, password });
    if (res.error) {
      setError(res.error);
      setIsLoading(false);
      return;
    }

    setShowToast({ message: 'Conta criada com sucesso! Redirecionando...', type: 'success' });
    setTimeout(() => navigate('/login'), 1200);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-violet-600 rounded-2xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tighter">AulaLog</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-2">Criar conta</h2>
          <p className="text-zinc-400 mb-8">Comece a registrar suas aulas hoje</p>
          
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="text-sm text-zinc-400 block mb-1.5">Nome completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-2xl px-4 py-3 text-white placeholder:text-zinc-500 outline-none"
                placeholder="João da Silva"
                required
              />
            </div>
            
            <div>
              <label className="text-sm text-zinc-400 block mb-1.5">E-mail acadêmico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-2xl px-4 py-3 text-white placeholder:text-zinc-500 outline-none"
                placeholder="aluno@universidade.edu"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 block mb-1.5">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-2xl px-4 py-3 text-white placeholder:text-zinc-500 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 block mb-1.5">Confirmar senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 focus:border-violet-500 rounded-2xl px-4 py-3 text-white placeholder:text-zinc-500 outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-violet-600 hover:bg-violet-500 transition-all text-white font-semibold rounded-2xl flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? 'Criando conta...' : 'Criar conta gratuita'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/login')}
              className="text-zinc-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Já tenho uma conta
            </button>
          </div>
        </div>
        
        <div className="text-center mt-6 text-xs text-zinc-500">
          Demo — Dados salvos apenas no navegador
        </div>
      </div>

      {showToast && (
        <Toast 
          message={showToast.message} 
          type={showToast.type} 
          onClose={() => setShowToast(null)} 
        />
      )}
    </div>
  );
}

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email) {
      setError('Por favor insira seu e-mail.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      setSuccess(true);
      setShowToast({ 
        message: 'E-mail de recuperação enviado! Verifique sua caixa de entrada.', 
        type: 'success' 
      });
      setIsLoading(false);
    }, 900);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">✉️</span>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">E-mail enviado</h2>
          <p className="text-zinc-400 mb-8">Um link de recuperação de senha foi enviado para <span className="font-medium text-white">{email}</span></p>
          
          <button
            onClick={() => navigate('/login')}
            className="w-full h-12 bg-white text-zinc-950 rounded-2xl font-medium"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Recuperar senha</h1>
          <p className="text-zinc-400 mb-8">Digite seu e-mail para receber um link de recuperação</p>
          
          <form onSubmit={handleReset}>
            <div className="mb-6">
              <label className="text-sm text-zinc-400 mb-2 block">Seu e-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800 text-white border border-zinc-700 rounded-2xl px-5 py-4 outline-none focus:border-violet-500"
                placeholder="seu@email.com"
                required
              />
            </div>

            {error && <div className="text-red-400 text-sm mb-4">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 transition-colors text-white font-semibold rounded-2xl"
            >
              {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>
        </div>
      </div>
      
      {showToast && (
        <Toast 
          message={showToast.message} 
          type={showToast.type} 
          onClose={() => setShowToast(null)} 
        />
      )}
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem(USER_STORAGE_KEY);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function Dashboard() {
  const navigate = useNavigate();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser] = useState<UserType>(DEMO_USER);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    disciplina: '',
    professor: '',
    data: '',
    resumo: '',
    duracao_minutos: '',
    tags: ''
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'disciplina'>('date');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('aulalog_theme') as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
    }
    try { localStorage.setItem('aulalog_theme', theme); } catch {}
  }, [theme]);

  // Load from localStorage
  useEffect(() => {
    const savedAulas = localStorage.getItem(STORAGE_KEY);
    if (savedAulas) {
      setAulas(JSON.parse(savedAulas));
    } else {
      // Seed some demo data
      const demoAulas: Aula[] = [
        {
          id: '1',
          user_id: DEMO_USER.id,
          titulo: 'Introdução à React Hooks',
          disciplina: 'Desenvolvimento Web',
          professor: 'Prof. Mariana Costa',
          data: '2025-02-12',
          resumo: 'Estudamos o uso de useState, useEffect e custom hooks. Vimos exemplos práticos de gerenciamento de estado em aplicações React modernas. Abordamos o ciclo de vida dos componentes funcionais.',
          duracao_minutos: 85,
          tags: ['react', 'hooks', 'frontend'],
          created_at: '2025-02-12T10:00:00Z',
          updated_at: '2025-02-12T10:00:00Z'
        },
        {
          id: '2',
          user_id: DEMO_USER.id,
          titulo: 'Teoria da Computação - Autômatos',
          disciplina: 'Teoria da Computação',
          professor: 'Dr. Ricardo Mendes',
          data: '2025-02-10',
          resumo: 'Nesta aula aprendemos sobre máquinas de Turing, autômatos finitos e expressões regulares. Exercícios práticos foram feitos em sala para identificar linguagens regulares.',
          duracao_minutos: 110,
          tags: ['teoria', 'computacao', 'automatons'],
          created_at: '2025-02-10T14:30:00Z',
          updated_at: '2025-02-10T14:30:00Z'
        },
        {
          id: '3',
          user_id: DEMO_USER.id,
          titulo: 'Banco de Dados - Normalização',
          disciplina: 'Banco de Dados',
          professor: 'Profª. Letícia Ferreira',
          data: '2025-02-08',
          resumo: 'Revisamos as formas normais. Aplicamos a 3ª forma normal em um modelo de e-commerce. Importante para evitar redundância de dados e garantir integridade.',
          duracao_minutos: 75,
          tags: ['sql', 'bd', 'normalizacao'],
          created_at: '2025-02-08T09:15:00Z',
          updated_at: '2025-02-08T09:15:00Z'
        }
      ];
      setAulas(demoAulas);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoAulas));
    }
  }, []);

  // Save to localStorage whenever aulas change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(aulas));
  }, [aulas]);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  };

  const filteredAndSortedAulas = React.useMemo(() => {
    let result = [...aulas];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(aula => 
        aula.disciplina.toLowerCase().includes(term) || 
        aula.titulo.toLowerCase().includes(term) ||
        aula.professor.toLowerCase().includes(term)
      );
    }

    if (sortBy === 'date') {
      result.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    } else {
      result.sort((a, b) => a.disciplina.localeCompare(b.disciplina));
    }

    return result;
  }, [aulas, searchTerm, sortBy]);

  const stats: Stats = React.useMemo(() => {
    const uniqueDisciplinas = new Set(aulas.map(a => a.disciplina)).size;
    const sortedByDate = [...aulas].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    const ultimaAula = sortedByDate.length > 0 ? sortedByDate[0].data : null;

    return {
      totalAulas: aulas.length,
      uniqueDisciplinas,
      ultimaAula
    };
  }, [aulas]);

  const resetForm = () => {
    setFormData({
      titulo: '',
      disciplina: '',
      professor: '',
      data: format(new Date(), 'yyyy-MM-dd'),
      resumo: '',
      duracao_minutos: '',
      tags: ''
    });
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
    setSelectedAula(null);
  };

  const openEditModal = (aula: Aula) => {
    setSelectedAula(aula);
    setFormData({
      titulo: aula.titulo,
      disciplina: aula.disciplina,
      professor: aula.professor,
      data: aula.data,
      resumo: aula.resumo,
      duracao_minutos: aula.duracao_minutos ? aula.duracao_minutos.toString() : '',
      tags: aula.tags ? aula.tags.join(', ') : ''
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (aula: Aula) => {
    setSelectedAula(aula);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitAula = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo || !formData.disciplina || !formData.professor || !formData.data || !formData.resumo) {
      addToast('Por favor preencha todos os campos obrigatórios.', 'error');
      return;
    }

    if (formData.resumo.length < 30) {
      addToast('O resumo deve conter no mínimo 30 caracteres.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const tagsArray = formData.tags 
      ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) 
      : undefined;

    const newAula: Aula = {
      id: selectedAula ? selectedAula.id : Date.now().toString(36),
      user_id: currentUser.id,
      titulo: formData.titulo,
      disciplina: formData.disciplina,
      professor: formData.professor,
      data: formData.data,
      resumo: formData.resumo,
      duracao_minutos: formData.duracao_minutos ? parseInt(formData.duracao_minutos) : undefined,
      tags: tagsArray,
      created_at: selectedAula ? selectedAula.created_at : now,
      updated_at: now
    };

    if (selectedAula) {
      // Update
      setAulas(prev => prev.map(a => a.id === selectedAula.id ? newAula : a));
      addToast('Aula atualizada com sucesso!', 'success');
      setIsEditModalOpen(false);
    } else {
      // Create
      setAulas(prev => [newAula, ...prev]);
      addToast('Aula registrada com sucesso!', 'success');
      setIsAddModalOpen(false);
    }

    resetForm();
    setSelectedAula(null);
  };

  const handleDeleteAula = () => {
    if (!selectedAula) return;

    setAulas(prev => prev.filter(a => a.id !== selectedAula.id));
    addToast('Aula excluída com sucesso!', 'success');
    setIsDeleteModalOpen(false);
    setSelectedAula(null);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd 'de' MMMM yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const getDurationLabel = (minutes?: number) => {
    if (!minutes) return '—';
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
  };

  const logout = async () => {
    try {
      await supabaseSignOut();
    } catch {
      // ignore
    }
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* HEADER */}
      <header className="border-b border-zinc-800 bg-zinc-900 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-violet-600 h-9 w-9 flex items-center justify-center rounded-2xl">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="font-bold tracking-tighter text-2xl">AulaLog</div>
            </div>
            <div className="hidden md:flex items-center bg-zinc-800 text-xs rounded-3xl px-3 py-1 text-emerald-400 border border-emerald-900">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-2"></div>
              DEMO MODE
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 bg-zinc-800 rounded-3xl pl-2 pr-5 py-1 text-sm">
              <div className="bg-zinc-700 h-8 w-8 rounded-2xl flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-sm leading-none">{currentUser.nome}</div>
                <div className="text-[10px] text-zinc-500">{currentUser.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                title="Toggle theme"
                className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-5 py-2.5 hover:bg-zinc-800 rounded-2xl transition-colors text-sm font-medium border border-zinc-700 hover:border-zinc-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 pt-8 pb-12">
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex justify-between">
              <div>
                <div className="text-xs tracking-[0.5px] text-zinc-500 mb-1">TOTAL DE AULAS</div>
                <div className="text-5xl font-semibold tabular-nums text-white">{stats.totalAulas}</div>
              </div>
              <div className="h-12 w-12 bg-violet-500/10 text-violet-400 rounded-2xl flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
            <div className="text-emerald-400 text-xs mt-6 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-current rounded-full"></span> 
              +3 este mês
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex justify-between">
              <div>
                <div className="text-xs tracking-[0.5px] text-zinc-500 mb-1">DISCIPLINAS</div>
                <div className="text-5xl font-semibold tabular-nums text-white">{stats.uniqueDisciplinas}</div>
              </div>
              <div className="h-12 w-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="text-zinc-400 text-xs mt-6">Diversidade de matérias registradas</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between">
              <div>
                <div className="text-xs tracking-[0.5px] text-zinc-500 mb-1">ÚLTIMA AULA</div>
                <div className="text-xl font-medium text-white">
                  {stats.ultimaAula 
                    ? formatDate(stats.ultimaAula) 
                    : 'Nenhuma aula'}
                </div>
              </div>
              <div className="h-12 w-12 bg-sky-500/10 text-sky-400 rounded-2xl flex items-center justify-center">
                <Eye className="h-6 w-6" />
              </div>
            </div>
            
            {stats.ultimaAula && (
              <div className="absolute bottom-6 right-6 text-[10px] bg-zinc-800 px-3 py-1 rounded-xl text-zinc-400">
                {format(parseISO(stats.ultimaAula), 'dd MMM', { locale: ptBR })}
              </div>
            )}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar por disciplina, título ou professor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 pl-12 py-4 rounded-3xl text-sm focus:outline-none focus:border-violet-500 placeholder:text-zinc-500"
            />
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'date' | 'disciplina')}
              className="bg-zinc-900 border border-zinc-800 text-sm rounded-3xl px-5 py-3 focus:outline-none focus:border-violet-500"
            >
              <option value="date">Mais recentes</option>
              <option value="disciplina">Por disciplina</option>
            </select>

            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 bg-white hover:bg-zinc-100 transition-colors text-zinc-900 px-6 py-3.5 rounded-3xl font-semibold text-sm shadow-inner active:scale-[0.985]"
            >
              <Plus className="h-4 w-4" /> NOVA AULA
            </button>
          </div>
        </div>

        {/* LIST */}
        {filteredAndSortedAulas.length === 0 ? (
          <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-3xl py-20 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-zinc-600 mb-4" />
            <h3 className="text-xl font-medium text-zinc-300">Nenhuma aula encontrada</h3>
            <p className="text-zinc-500 max-w-xs mx-auto mt-3">
              {searchTerm 
                ? `Não encontramos resultados para "${searchTerm}". Tente outro termo.` 
                : 'Adicione sua primeira aula usando o botão acima.'}
            </p>
            {!searchTerm && (
              <button 
                onClick={openAddModal}
                className="mt-8 px-8 py-3 bg-white text-black rounded-3xl text-sm font-medium inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Registrar primeira aula
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAndSortedAulas.map((aula) => (
              <div 
                key={aula.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 group rounded-3xl p-6 transition-all duration-200 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest bg-zinc-800 px-3 py-1 rounded-2xl text-violet-300">
                      {formatDate(aula.data).split(' de ')[0]}
                    </div>
                    <h3 className="font-semibold text-lg leading-tight mt-4 line-clamp-2 pr-8">{aula.titulo}</h3>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => openEditModal(aula)}
                      className="h-8 w-8 flex items-center justify-center hover:bg-zinc-800 rounded-xl text-sky-400"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => openDeleteModal(aula)}
                      className="h-8 w-8 flex items-center justify-center hover:bg-zinc-800 rounded-xl text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-x-3 text-xs mb-5">
                  <div className="bg-zinc-800 px-3 py-1 rounded-2xl text-amber-300">{aula.disciplina}</div>
                  <div className="text-zinc-500">•</div>
                  <div className="text-zinc-400 truncate">{aula.professor.split(' ').slice(0, 2).join(' ')}</div>
                </div>

                <div className="text-zinc-400 text-sm line-clamp-4 flex-1 mb-6 border-l-2 border-zinc-700 pl-4 text-[13px]">
                  {aula.resumo}
                </div>

                <div className="flex items-center justify-between text-xs border-t border-zinc-800 pt-4 mt-auto">
                  <div className="flex items-center gap-3">
                    {aula.tags && aula.tags.length > 0 && (
                      <div className="flex gap-1">
                        {aula.tags.slice(0, 2).map((tag, idx) => (
                          <span key={idx} className="bg-zinc-950 px-2 py-px rounded text-[10px] text-zinc-500">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-zinc-400">
                    <div>{getDurationLabel(aula.duracao_minutos)}</div>
                    <div className="w-px h-3 bg-zinc-700"></div>
                    <div>{format(parseISO(aula.updated_at), 'HH:mm')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FOOTER STATS */}
        <div className="text-center mt-16 text-xs text-zinc-500 flex items-center justify-center gap-5">
          <div>{filteredAndSortedAulas.length} de {aulas.length} aulas exibidas</div>
          <div className="w-px h-2.5 bg-zinc-700"></div>
          <div>RLS • Autenticação simulada</div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden border border-zinc-700">
            <div className="px-8 pt-8 pb-6 border-b border-zinc-800">
              <h2 className="text-2xl font-semibold">
                {isEditModalOpen ? 'Editar Aula' : 'Registrar Nova Aula'}
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                {isEditModalOpen ? 'Atualize as informações da aula' : 'Preencha os detalhes da aula assistida'}
              </p>
            </div>

            <form onSubmit={handleSubmitAula} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-2">TÍTULO DA AULA</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-4 text-lg placeholder:text-zinc-600 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-violet-500"
                    placeholder="Nome da aula ou tema principal"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">DISCIPLINA</label>
                  <input
                    type="text"
                    value={formData.disciplina}
                    onChange={(e) => setFormData({...formData, disciplina: e.target.value})}
                    className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-3.5 placeholder:text-zinc-600"
                    placeholder="Ex: Algoritmos"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">PROFESSOR</label>
                  <input
                    type="text"
                    value={formData.professor}
                    onChange={(e) => setFormData({...formData, professor: e.target.value})}
                    className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-3.5 placeholder:text-zinc-600"
                    placeholder="Nome do docente"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">DATA DA AULA</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({...formData, data: e.target.value})}
                    className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-3.5 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">DURAÇÃO (minutos)</label>
                  <input
                    type="number"
                    value={formData.duracao_minutos}
                    onChange={(e) => setFormData({...formData, duracao_minutos: e.target.value})}
                    className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-3.5 placeholder:text-zinc-600"
                    placeholder="75"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-zinc-400">RESUMO DA AULA <span className="text-rose-400">*</span></label>
                  <span className={cn(
                    "text-xs tabular-nums",
                    formData.resumo.length >= 30 ? 'text-emerald-400' : 'text-amber-400'
                  )}>
                    {formData.resumo.length}/30 min
                  </span>
                </div>
                <textarea
                  value={formData.resumo}
                  onChange={(e) => setFormData({...formData, resumo: e.target.value})}
                  className="w-full h-28 bg-black border border-zinc-700 rounded-3xl p-5 resize-y min-h-[110px] placeholder:text-zinc-600 focus:outline focus:outline-1 focus:-outline-offset-1 focus:outline-violet-500"
                  placeholder="O que foi ensinado? Principais conceitos, exercícios e aprendizados..."
                  required
                />
                {formData.resumo.length > 0 && formData.resumo.length < 30 && (
                  <p className="text-rose-400 text-xs mt-1.5">O resumo precisa ter no mínimo 30 caracteres ({formData.resumo.length})</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">TAGS (separadas por vírgula)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-3.5 placeholder:text-zinc-600"
                  placeholder="react, frontend, javascript"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Ex: backend, api, nodejs</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 py-4 text-sm border border-zinc-700 hover:bg-zinc-900 rounded-2xl transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-white text-zinc-950 font-semibold rounded-2xl hover:bg-zinc-100 transition-all active:scale-95"
                >
                  {isEditModalOpen ? 'ATUALIZAR AULA' : 'SALVAR AULA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && selectedAula && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4">
          <div className="bg-zinc-900 w-full max-w-md rounded-3xl p-8 border border-red-900/60">
            <div className="text-red-400 mb-2">
              <Trash2 className="h-9 w-9" />
            </div>
            <h3 className="text-2xl font-semibold mt-6">Excluir esta aula?</h3>
            <p className="mt-3 text-zinc-400 leading-relaxed">
              Esta ação não pode ser desfeita. O registro da aula <span className="font-medium text-white">"{selectedAula.titulo}"</span> será removido permanentemente.
            </p>
            
            <div className="mt-10 flex gap-4">
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedAula(null);
                }}
                className="flex-1 py-4 text-sm border border-zinc-700 rounded-2xl hover:bg-zinc-950"
              >
                CANCELAR
              </button>
              <button 
                onClick={handleDeleteAula}
                className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-2xl transition-colors"
              >
                SIM, EXCLUIR
              </button>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-xs text-zinc-500">Apenas este registro será afetado</p>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE TOASTS */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
        />
      ))}
    </div>
  );
}

export default function App() {
  React.useEffect(() => {
    try {
      const theme = (localStorage.getItem('aulalog_theme') as 'dark' | 'light') || 'dark';
      const root = document.documentElement;
      if (theme === 'light') root.classList.add('theme-light');
      else root.classList.remove('theme-light');
    } catch {
      // ignore
    }
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
