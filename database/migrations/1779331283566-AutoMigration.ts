import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1779331283566 implements MigrationInterface {
  name = 'AutoMigration1779331283566';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cursos" ADD "urlImagem" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cursos" DROP COLUMN "urlImagem"`);
  }
}
