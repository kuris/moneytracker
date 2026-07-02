'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { AUTHORS, categoriesFor, type TxType } from '@/lib/categories'
import { todayISO } from '@/lib/format'
import { addTransaction } from '@/app/actions/transactions'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

function parseSMS(text: string) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  let amount = '';
  let date = '';
  let description = '';
  let author = '';
  let paymentMethod = '';

  const lowerText = text.toLowerCase();
  const isCard = lowerText.includes('카드') || lowerText.includes('승인') || lowerText.includes('체크') || lowerText.includes('pay') || lowerText.includes('페이');
  const isCash = lowerText.includes('현금') || lowerText.includes('현금영수증') || lowerText.includes('계좌이체') || lowerText.includes('송금');
  
  if (isCard) {
    paymentMethod = 'card';
  } else if (isCash) {
    paymentMethod = 'cash';
  } else if (text.trim().length > 0) {
    paymentMethod = 'card';
  }

  if (text.includes('김*형') || text.includes('김진형') || text.includes('진형') || text.includes('남편')) {
    author = '남편';
  } else if (text.includes('송은숙') || text.includes('송*숙') || text.includes('은숙') || text.includes('아내') || text.includes('부인') || text.includes('와이프')) {
    author = '아내';
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const dateMatch = line.match(/(\d{2})[/-](\d{2})\s+(\d{2}):(\d{2})/) || line.match(/(\d{2})[/-](\d{2})/);
    if (dateMatch && !date) {
      const currentYear = new Date().getFullYear();
      const month = dateMatch[1];
      const day = dateMatch[2];
      date = `${currentYear}-${month}-${day}`;
    }

    if (!line.includes('누적')) {
      const amountMatch = line.match(/([\d,]+)\s*원/);
      if (amountMatch) {
        amount = amountMatch[1].replace(/,/g, '');
      }
    }
  }

  if (!amount) {
    for (const line of lines) {
      if (!line.includes('누적')) {
        const numberMatch = line.match(/([\d,]+)\s*(원|일시불)/);
        if (numberMatch) {
          amount = numberMatch[1].replace(/,/g, '');
          break;
        }
      }
    }
  }

  const cardCompanyKeywords = [
    '우리', '신한', '국민', '삼성', '현대', '롯데', '하나', '농협', '카카오', '네이버', '토스', '비씨', 'bc',
    '카드', '체크', '승인', '거절', '취소', '전표', '일시불', '할부'
  ];
  const excludedLineIndicators = [
    '[web발신]', 'web발신', '원', '누적', '잔액', '님', '배송', '택배', '결제', '완료'
  ];

  const candidateLines = lines.filter(line => {
    const lowerLine = line.toLowerCase();
    
    if (/^\d{2}[/-]\d{2}/.test(line)) return false;
    if (/\d{2}:\d{2}/.test(line)) return false;

    for (const kw of excludedLineIndicators) {
      if (lowerLine.includes(kw)) return false;
    }

    const hasCardKw = cardCompanyKeywords.some(kw => lowerLine.includes(kw));
    if (hasCardKw && (lowerLine.includes('승인') || /\(\d{4}\)/.test(line))) {
      return false;
    }

    if (line.endsWith('님') && line.length < 10) {
      return false;
    }

    return true;
  });

  if (candidateLines.length > 0) {
    description = candidateLines[candidateLines.length - 1];
  }

  return {
    amount,
    date,
    description,
    author,
    paymentMethod,
  };
}

function guessCategory(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes('마트') || desc.includes('슈퍼') || desc.includes('다이소') || desc.includes('올리브영') || desc.includes('쿠팡') || desc.includes('백화점')) {
    return 'living';
  }
  if (desc.includes('식당') || desc.includes('카페') || desc.includes('커피') || desc.includes('배민') || desc.includes('이츠') || desc.includes('밥') || desc.includes('푸드') || desc.includes('편의점') || desc.includes('식비') || desc.includes('스타벅스') || desc.includes('제과') || desc.includes('빵')) {
    return 'food';
  }
  if (desc.includes('택시') || desc.includes('주유') || desc.includes('오일') || desc.includes('충전소') || desc.includes('철도') || desc.includes('코레일') || desc.includes('버스') || desc.includes('지하철') || desc.includes('교통') || desc.includes('터널') || desc.includes('하이패스')) {
    return 'transport';
  }
  if (desc.includes('병원') || desc.includes('의원') || desc.includes('치과') || desc.includes('내과') || desc.includes('약국') || desc.includes('치료')) {
    return 'medical';
  }
  if (desc.includes('가스') || desc.includes('전기') || desc.includes('수도') || desc.includes('아파트') || desc.includes('관리비') || desc.includes('렌탈')) {
    return 'housing';
  }
  if (desc.includes('영화') || desc.includes('cgv') || desc.includes('넷플릭스') || desc.includes('공연') || desc.includes('티켓') || desc.includes('도서') || desc.includes('책') || desc.includes('노래방') || desc.includes('게임')) {
    return 'culture';
  }
  return 'etc_expense';
}

export function TransactionForm({ onAdded }: { onAdded: () => void }) {
  const [author, setAuthor] = useState<string>(AUTHORS[0])
  const [type, setType] = useState<TxType>('expense')
  const [category, setCategory] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [date, setDate] = useState<string>(todayISO())
  const [paymentMethod, setPaymentMethod] = useState<string>('card')
  const [submitting, setSubmitting] = useState(false)
  const [smsText, setSmsText] = useState('')

  const categories = categoriesFor(type)

  function changeType(next: TxType) {
    setType(next)
    setCategory('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numericAmount = Number(amount.replace(/,/g, ''))
    if (!category) {
      toast.error('분류를 선택해 주세요.')
      return
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error('금액을 올바르게 입력해 주세요.')
      return
    }
    setSubmitting(true)
    try {
      await addTransaction({
        author,
        type,
        category,
        amount: numericAmount,
        description,
        paymentMethod,
        date,
      })
      toast.success('저장되었습니다.')
      setAmount('')
      setDescription('')
      setCategory('')
      setSmsText('')
      setPaymentMethod('card')
      onAdded()
    } catch (err) {
      toast.error('저장에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* SMS 붙여넣기 자동 입력 */}
      <div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-3.5 border border-dashed border-border/80">
        <Label htmlFor="sms-paste" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          💬 SMS 내역 자동 입력
        </Label>
        <textarea
          id="sms-paste"
          placeholder="여기에 카드 승인 문자나 내역을 붙여넣으세요. 날짜, 금액, 사용처가 자동 입력됩니다."
          value={smsText}
          onChange={(e) => {
            const val = e.target.value
            setSmsText(val)
            if (!val.trim()) return
            
            const parsed = parseSMS(val)
            if (parsed.amount) {
              setAmount(Number(parsed.amount).toLocaleString('ko-KR'))
            }
            if (parsed.date) {
              setDate(parsed.date)
            }
            if (parsed.description) {
              setDescription(parsed.description)
              // Guess category
              const guessedCat = guessCategory(parsed.description)
              setCategory(guessedCat)
            }
            if (parsed.author) {
              setAuthor(parsed.author)
            }
            if (parsed.paymentMethod) {
              setPaymentMethod(parsed.paymentMethod)
            }
            toast.success('내역 분석 완료! 입력란을 확인해 주세요.')
          }}
          className="min-h-[70px] w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {smsText && (
          <button
            type="button"
            onClick={() => {
              setSmsText('')
              setAmount('')
              setDescription('')
              setCategory('')
              setDate(todayISO())
            }}
            className="text-[10px] text-muted-foreground hover:text-destructive self-end font-medium transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      {/* 작성자 */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm text-muted-foreground">작성자</Label>
        <div className="grid grid-cols-2 gap-2">
          {AUTHORS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAuthor(a)}
              className={cn(
                'rounded-lg border py-2.5 text-sm font-medium transition-colors',
                author === a
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted',
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* 수입/지출 */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm text-muted-foreground">구분</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => changeType('expense')}
            className={cn(
              'rounded-lg border py-2.5 text-sm font-medium transition-colors',
              type === 'expense'
                ? 'border-expense bg-expense text-expense-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted',
            )}
          >
            지출
          </button>
          <button
            type="button"
            onClick={() => changeType('income')}
            className={cn(
              'rounded-lg border py-2.5 text-sm font-medium transition-colors',
              type === 'income'
                ? 'border-income bg-income text-income-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted',
            )}
          >
            수입
          </button>
        </div>
      </div>

      {/* 결제 수단 */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm text-muted-foreground">결제 수단</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            key="card"
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={cn(
              'rounded-lg border py-2.5 text-sm font-medium transition-colors',
              paymentMethod === 'card'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted',
            )}
          >
            카드
          </button>
          <button
            key="cash"
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={cn(
              'rounded-lg border py-2.5 text-sm font-medium transition-colors',
              paymentMethod === 'cash'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted',
            )}
          >
            현금
          </button>
        </div>
      </div>

      {/* 날짜 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="date" className="text-sm text-muted-foreground">
          날짜
        </Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-11"
        />
      </div>

      {/* 분류 */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm text-muted-foreground">분류</Label>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v ?? '')}
        >
          <SelectTrigger className="h-11 w-full">
            <SelectValue placeholder="분류를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => {
              const Icon = c.icon
              return (
                <SelectItem key={c.value} value={c.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground shrink-0" />
                    <span>{c.label}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* 금액 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="amount" className="text-sm text-muted-foreground">
          금액
        </Label>
        <div className="relative">
          <Input
            id="amount"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d]/g, '')
              setAmount(raw ? Number(raw).toLocaleString('ko-KR') : '')
            }}
            className="h-11 pr-8 text-right text-base font-semibold tabular-nums"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            원
          </span>
        </div>
      </div>

      {/* 사용처/내용 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="description" className="text-sm text-muted-foreground">
          사용처 / 내용
        </Label>
        <Input
          id="description"
          placeholder="예: 마트 장보기"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="h-11"
        />
      </div>

      <Button type="submit" disabled={submitting} className="h-11 w-full">
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        저장하기
      </Button>
    </form>
  )
}
