import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';

@Entity('public_holiday')
@Unique(['country', 'date'])
export class PublicHoliday {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'RO' })
  country: string;

  @Column({ type: 'date' })
  date: Date;

  @Column()
  name: string;

  @Column()
  year: number;
}
